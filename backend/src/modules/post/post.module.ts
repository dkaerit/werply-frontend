import { Module } from '@nestjs/common';
import { PostController } from './post.controller';
import { PostService,  } from './post.service';
import { PostFeatured } from './post.schema';
import { MutualModule } from '../mutual/mutual.module';
import { SharedModule } from '../shared/shared.module';

@Module({
  imports: [PostFeatured, MutualModule, SharedModule],
  controllers: [PostController],
  providers: [PostService, SharedModule],
  exports: [PostService, SharedModule]
})
export class PostModule {}
