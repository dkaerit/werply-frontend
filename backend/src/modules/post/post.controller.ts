import { Controller, Post, Body, Query, Delete, Param } from '@nestjs/common';
import { PostService } from './post.service';
import { CreatePostDto, GetPostsFilterDto } from './post.dto';

@Controller('posts')
export class PostController {
  constructor(private readonly postService: PostService) { }

  /**
   * Endpoint para obtener posts paginados.
   * #param page Número de página (por defecto: 1).
   * #param pageSize Tamaño de la página (por defecto: 10).
   * #param filters Filtros opcionales para la consulta.
   * #returns Array de posts paginados.
   */
  @Post("read")
  async getPosts(
    @Query('page') page: number = 1, 
    @Query('pageSize') pageSize: number = 10, 
    @Body() filters: GetPostsFilterDto = {}
  ) {
    return this.postService.getPosts(page, pageSize, filters);
  }

  /**
   * Endpoint para crear un nuevo post.
   * #param postDto DTO (Data Transfer Object) que contiene los detalles del nuevo post.
   * #returns El post recién creado.
   */
  @Post("create")
  async createPost(@Body() postDto: CreatePostDto) {
    return this.postService.createPost(postDto);
  }

  /**
   * Endpoint para eliminar un post por su ID.
   * #param postId ID del post a eliminar.
   */
  @Delete('delete/id:postId')
  async deletePost(@Param('postId') postId: string) {
    postId = postId.replace(':', '');
    return this.postService.deletePost(postId);
  }
}