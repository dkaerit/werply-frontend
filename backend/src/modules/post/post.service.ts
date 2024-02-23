import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Post, PostDocument } from './post.schema';
import { CreatePostDto, GetPostsFilterDto } from './post.dto';
import { MutualService } from '../mutual/mutual.service';
import { AppGateway } from 'src/midlewares/websocketGateway';

@Injectable()
export class PostService {
  constructor(
    @InjectModel(Post.name) private postModel: Model<PostDocument>,
    private readonly appGateway: AppGateway,
    private readonly mutualService: MutualService
  ) { }

  /**
   * Obtiene los posts paginados y opcionalmente filtrados.
   * #param page Número de página.
   * #param pageSize Tamaño de la página.
   * #param filters Filtros opcionales.
   * #returns Una lista de posts.
   */
  async getPosts(
    page: number | undefined, 
    pageSize: number | undefined, 
    filters?: GetPostsFilterDto,
    ): Promise<Post[]> {

    let query = this.postModel.find();

    // construir lista de condiciones
    if (filters?.globalAuthorType) query = query.where('authorType').equals(filters.globalAuthorType);
    if (filters?.authors?.length > 0) {
      const authorIds: string[] = filters.authors.map((author) => author.authorId);
      query = query.where('authorId').in(authorIds);
    } 

    // Filtrar por fecha si se proporciona una de referencia
    if (filters?.referenceDate) {
      const referenceDate = filters.referenceDate instanceof Date
      ? filters.referenceDate
      : new Date(filters.referenceDate);

      query = filters?.loadSide === 'top'
        ? query.where('createdAt').gt(referenceDate.getTime()) // mayores que la fecha dada
        : query.where('createdAt').lt(referenceDate.getTime()); // menores que la fecha dada
    }

    // Ordenar por fecha de creación (más reciente primero)
    query = query.sort({ createdAt: -1 });

    // paginación
    if (page !== undefined && pageSize !== undefined) {
      const skip = (page - 1) * pageSize;
      query = query.limit(pageSize).skip(skip);
    }
  
    const posts = await query.exec();
    return posts;
  }

  /**
   * Obtiene los IDs de los mutuals de un usuario.
   * #param id ID del usuario/pj.
   * #returns Una lista de IDs de mutuals.
   */
  async getMutuals(id: string): Promise<string[]> {
    const mutuals = await this.mutualService.getUserMutuals(id);
    const mutualIds = mutuals.map(mutual => (mutual.id1 === id) ? mutual.id2 : mutual.id1);
    return mutualIds;
  }

  /**
   * Crea un nuevo post y emite una notificación a los mutuals.
   * #param postDto Datos del post a crear.
   * #returns El post creado.
   */
  async createPost(postDto: CreatePostDto): Promise<Post> {
    const createdPost = new this.postModel(postDto);
    const newPost = await createdPost.save();

    const mutualIds = await this.getMutuals(postDto.authorId); // mutuals del postDto.authorId
    this.appGateway.sendNotificationToMutuals(mutualIds, 'newPost', postDto.authorId, "Un mutual posteó un nuevo post");
    
    return newPost;
  }

  /**
   * Elimina un post por su ID.
   * #param postId ID del post a eliminar.
   * #throws NotFoundException si el post no se encuentra.
   * #returns El post eliminado.
   */
  async deletePost(postId: string): Promise<Post> {
      const post = await this.postModel.findByIdAndDelete(postId).exec();
      const mutualIds = await this.getMutuals(post.authorId); // mutuals del postDto.authorId
      this.appGateway.sendNotificationToMutuals(mutualIds, 'deletePost', post.authorId, "Un mutual borró uno de sus posts");
    
    if (!post)
    throw new Error(`Post with ID ${postId} not found`);

    return post;
  }
}
