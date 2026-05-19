// src/user/dto/create-user.dto.ts
import {
  IsString,
  IsEmail,
  IsDateString,
  IsArray,
  IsNotEmpty,
  IsOptional,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({
    example: 'João Silva',
    description: 'Nome completo do usuário',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'joao@email.com', description: 'E-mail único' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'senhaSegura123', description: 'Senha de acesso' })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({})
  @IsString()
  @IsOptional()
  otpCode: string;

  @ApiProperty({
    description: 'Data que expira o OTP',
  })
  @IsDateString()
  @IsOptional()
  otpExpiresAt: Date;

  @ApiProperty({
    example: '1995-08-25',
    description: 'Data de nascimento formato ISO',
  })
  @IsDateString()
  @IsNotEmpty()
  birthday: Date;

  @ApiProperty({ example: 'admin' })
  @IsString()
  @IsNotEmpty()
  role: string;

  @ApiProperty({ example: 'Desenvolvedor Backend' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'CRM-SP' })
  @IsString()
  @IsNotEmpty()
  council: string;

  @ApiProperty({ example: 'Squad Alpha' })
  @IsString()
  @IsNotEmpty()
  team: string;

  @ApiProperty({ example: [], required: false, type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tasks?: string[];

  @ApiProperty({ example: [], required: false, type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  notifications?: string[];

  @ApiProperty({ example: 'active' })
  @IsString()
  @IsNotEmpty()
  status: string;

  @ApiProperty({ example: '123.456.789-00' })
  @IsString()
  @IsNotEmpty()
  document: string;
}
