// src/auth/auth.controller.ts
import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreateLoginDto } from '../login/dto/create-login.dto';
import { LoginVerifyDto } from '../login/dto/login-verify.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login-request')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Etapa 1: Validar senha e disparar OTP por e-mail' })
  @ApiResponse({ status: 200, description: 'OTP enviado com sucesso.' })
  @ApiResponse({ status: 401, description: 'Credenciais inválidas.' })
  requestLogin(@Body() loginRequestDto: CreateLoginDto) {
    return this.authService.requestLogin(loginRequestDto);
  }

  @Post('login-verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Etapa 2: Validar o OTP informado e gerar o Token JWT',
  })
  @ApiResponse({
    status: 200,
    description: 'Autenticado com sucesso. Retorna o JWT.',
  })
  @ApiResponse({ status: 401, description: 'OTP inválido.' })
  @ApiResponse({ status: 400, description: 'OTP expirado.' })
  verifyLogin(@Body() loginVerifyDto: LoginVerifyDto) {
    return this.authService.verifyLogin(loginVerifyDto);
  }
}
