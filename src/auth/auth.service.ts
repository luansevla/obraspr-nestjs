// src/auth/auth.service.ts
import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as nodemailer from 'nodemailer';
import { User, UserDocument } from '../user/schema/user.schema';
import { CreateLoginDto } from '../login/dto/create-login.dto';
import { LoginVerifyDto } from '../login/dto/login-verify.dto';

@Injectable()
export class AuthService {
  private transporter;

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
  ) {
    // Configuração do Nodemailer (Substitua com suas credenciais do Mailtrap/SMTP)
    this.transporter = nodemailer.createTransport({
      host: 'sandbox.smtp.mailtrap.io', // Exemplo com Mailtrap
      port: 2525,
      auth: {
        user: 'seu_usuario_smtp',
        pass: 'sua_senha_smtp',
      },
    });
  }

  // ETAPA 1: Validar senha e enviar OTP
  async requestLogin(loginRequestDto: CreateLoginDto) {
    const { email, password } = loginRequestDto;

    // Busca o usuário explicitamente trazendo o password que costuma ser ocultado
    const user = await this.userModel
      .findOne({ email: email.toLowerCase() })
      .exec();
    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    // Valida a senha usando bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    // Gera um OTP aleatório de 6 dígitos
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Define expiração para daqui a 5 minutos
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 5);

    // Salva o OTP e a expiração no registro do usuário
    user.otpCode = otp;
    user.otpExpiresAt = expiresAt;
    await user.save();

    // Envia o e-mail com o OTP
    await this.sendOtpEmail(user.email, otp);

    return { message: 'Código OTP enviado para o seu e-mail.' };
  }

  // ETAPA 2: Validar o OTP e entregar o Token JWT
  async verifyLogin(loginVerifyDto: LoginVerifyDto) {
    const { email, otp } = loginVerifyDto;

    const user = await this.userModel
      .findOne({ email: email.toLowerCase() })
      .exec();
    if (!user || !user.otpCode || !user.otpExpiresAt) {
      throw new BadRequestException('Requisição de login inválida ou expirada');
    }

    // Verifica se o OTP expirou
    if (new Date() > user.otpExpiresAt) {
      throw new BadRequestException(
        'Código OTP expirou. Solicite um novo login.',
      );
    }

    // Verifica se o OTP confere
    if (user.otpCode !== otp) {
      throw new UnauthorizedException('Código OTP incorreto');
    }

    // Limpa o OTP do banco após o uso (por segurança)
    user.otpCode = undefined;
    user.otpExpiresAt = undefined;
    await user.save();

    // Gera o payload do JWT
    const payload = {
      sub: user._id,
      email: user.email,
      role: user.role,
      team: user.team,
    };

    // Retorna o token de acesso
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        name: user.name,
        email: user.email,
        role: user.role,
        title: user.title,
      },
    };
  }

  // Função auxiliar para disparar o e-mail
  private async sendOtpEmail(to: string, otp: string) {
    const mailOptions = {
      from: '"Security System" <no-reply@suaempresa.com>',
      to,
      subject: 'Seu Código de Verificação (OTP)',
      text: `Seu código de acesso é: ${otp}. Ele expira em 5 minutos.`,
      html: `<b>Seu código de acesso é:</b> <h2>${otp}</h2> <p>Ele expira em 5 minutos.</p>`,
    };

    try {
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Erro ao enviar e-mail de OTP:', error);
      throw new BadRequestException(
        'Não foi possível enviar o e-mail de verificação.',
      );
    }
  }
}
