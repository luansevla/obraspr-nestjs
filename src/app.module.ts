import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthResolver } from './auth/auth.resolver';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { LoginModule } from './login/login.module';

@Module({
  imports: [AuthModule, UserModule, LoginModule],
  controllers: [AppController],
  providers: [AppService, AuthResolver],
})
export class AppModule {}
