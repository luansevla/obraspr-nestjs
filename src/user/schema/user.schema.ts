// src/user/schemas/user.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type UserDocument = User & Document;

@Schema({ timestamps: true }) // Cria automaticamente createdAt e updatedAt
export class User {
  @ApiProperty({
    description: 'ID gerado pelo MongoDB',
    example: '60d5ecb8b392d211c4f34a12',
  })
  _id: string;

  @ApiProperty({ example: 'João Silva' })
  @Prop({ required: true })
  name: string;

  @ApiProperty({ example: 'joao@email.com' })
  @Prop({ required: true, unique: true, lowercase: true })
  email: string;

  @Prop({ required: true }) // Omitido do ApiProperty para não expor a senha na doc do Schema de retorno
  password: string;

  @Prop({ required: false })
  otpCode?: string;

  @Prop({ required: false })
  otpExpiresAt?: Date;

  @ApiProperty({ example: '1995-08-25' })
  @Prop({ required: true })
  birthday: Date;

  @ApiProperty({ example: 'admin' })
  @Prop({ required: true })
  role: string;

  @ApiProperty({ example: 'Desenvolvedor Backend' })
  @Prop({ required: true })
  title: string;

  @ApiProperty({ example: 'CRM-SP' })
  @Prop({ required: true })
  council: string;

  @ApiProperty({ example: 'Squad Alpha' })
  @Prop({ required: true })
  team: string;

  @ApiProperty({ example: ['task_id_1', 'task_id_2'], type: [String] })
  @Prop({ type: [String], default: [] })
  tasks: string[];

  @ApiProperty({ example: ['notification_id_1'], type: [String] })
  @Prop({ type: [String], default: [] })
  notifications: string[];

  @ApiProperty({ example: 'active' })
  @Prop({ required: true, default: 'active' })
  status: string;

  @ApiProperty({ example: '123.456.789-00' })
  @Prop({ required: true, unique: true })
  document: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
