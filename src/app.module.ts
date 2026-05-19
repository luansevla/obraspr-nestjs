import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { LoginModule } from './login/login.module';
import { MongooseModule } from '@nestjs/mongoose';
import { CryptoService } from './crypto/crypto.service';

@Module({
  imports: [
    AuthModule,
    UserModule,
    LoginModule,
    MongooseModule.forRoot('mongodb://localhost:27017/secid_db'),
  ],
  controllers: [AppController],
  providers: [AppService, CryptoService],
})
export class AppModule {}
