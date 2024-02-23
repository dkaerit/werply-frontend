// common
import { Module } from '@nestjs/common';
import * as dotenv from 'dotenv'; dotenv.config();

// module dependencies
import { BaseController } from './base.controller';
import { BaseService } from './base.service';
import { UserModule } from '../user/user.module';
import { AuthModule } from '../auth/auth.module';
import { MutualModule } from '../mutual/mutual.module';
import { CharacterModule } from '../character/character.module';
import { PostModule } from '../post/post.module';
import { DevtoolsModule } from '@nestjs/devtools-integration';

// mongoose
import { MongoModule } from '../../database/mongo.module';

@Module({
  imports: [ 
    MongoModule, // Módulo de MongoDB.
    UserModule, // Módulo de usuarios (dependencia).
    CharacterModule, // Módulo de personajes (dependencia).
    AuthModule, // Módulo de usuarios (dependencia).
    MutualModule,
    PostModule,
    DevtoolsModule.register({
      http: process.env.NODE_ENV !== 'production',
    }),
  ],
  controllers: [BaseController],
  providers: [BaseService],
})
export class BaseModule {}
