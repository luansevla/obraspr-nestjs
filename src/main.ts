import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 1. OBTENÇÃO DO CONFIG_SERVICE (Para ler variáveis do .env)
  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') || 3000;

  // 2. PREFIXO GLOBAL DE ROTAS
  // Todas as suas rotas vão começar com /api (Ex: http://localhost:3000/api/auth/login)
  app.setGlobalPrefix('api');

  // 3. PIPES DE VALIDAÇÃO GLOBAL (Segurança para os DTOs)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Remove campos que não estão no DTO
      forbidNonWhitelisted: true, // Bloqueia a requisição se enviarem campos inválidos
      transform: true, // Transforma os tipos dos dados automaticamente (ex: string para número)
    }),
  );

  // 4. CONFIGURAÇÃO COMPLETA DO CORS
  app.enableCors({
    origin: '*', // Em produção, mude para o domínio do seu front-end (ex: 'https://meuapp.com')
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Accept', 'Authorization'],
    credentials: true, // Necessário para aceitar cookies/tokens compartilhados
  });

  // 5. CONFIGURAÇÃO ROBUSTA DO SWAGGER
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Obras PR - API')
    .setDescription(
      'Documentação do backend contendo autenticação JWT, integração com Google Authenticator (2FA) e gerenciamento de usuários.',
    )
    .setVersion('1.0.0')

    // Configura a autenticação Bearer (JWT) no topo do painel do Swagger
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Insira o token JWT gerado no login para acessar as rotas protegidas.',
        in: 'header',
      },
      'token-jwt', // Nome identificador para usar nos Controllers como @ApiBearerAuth('token-jwt')
    )
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);

  // A documentação abrirá em: http://localhost:3000/docs
  // Usamos '/docs' já que '/api' ficou reservado para as rotas da aplicação
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true, // Mantém o token salvo mesmo se você der F5 na página do Swagger
    },
  });

  // 6. INICIALIZAÇÃO DA APLICAÇÃO
  await app.listen(port);

  console.log(`\n======================================================`);
  console.log(`🚀 Servidor rodando em:   http://localhost:${port}/api`);
  console.log(`📄 Documentação Swagger:  http://localhost:${port}/docs`);
  console.log(`======================================================\n`);
}
bootstrap();
