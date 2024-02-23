import { UserModule } from './../user/user.module';
import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import JwtModule from '../../streategies/jwt/jwt.module';
import { JwtStrategy } from '../../streategies/jwt/jwt.strategy';
import { SharedModule } from '../shared/shared.module';

@Module({
  imports: [
    JwtModule, 
    UserModule,
    SharedModule 
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [SharedModule]
})
export class AuthModule {}
