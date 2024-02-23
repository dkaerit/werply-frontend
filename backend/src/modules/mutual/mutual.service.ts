import { Injectable } from '@nestjs/common';
import { Mutual, MutualDocument } from './mutual.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateMutualDto } from './mutual.dto';

@Injectable()
export class MutualService {
   constructor(@InjectModel(Mutual.name) private mutualModel: Model<MutualDocument>) {}
   
  /**
   * Obtiene todos los registros de mutuals.
   * #returns Lista de mutuals.
   */
  async getAllMutuals(): Promise<Mutual[]> {
   return await this.mutualModel.find().exec();
 }

   /**
   * Obtiene todos los mutuals de un usuario específico.
   * #param id ID del usuario/personaje para el cual se obtienen los mutuals.
   * #returns Lista de mutuals del usuario.
   */
   async getUserMutuals(id: string): Promise<Mutual[]> {
    return await this.mutualModel.find({ $or: [{ id1: id }, { id2: id }] }).exec();
  }

 /**
  * Crea un nuevo mutual.
  * #param createMutualDto Datos para crear un mutual.
  * #returns El mutual creado.
  */
 async createMutual(createMutualDto: CreateMutualDto): Promise<Mutual> {
   const createdMutual = new this.mutualModel(createMutualDto);
   return await createdMutual.save();
 }

 /**
  * Elimina un mutual por su ID.
  * #param mutualId ID del mutual a eliminar.
  * #returns El mutual eliminado.
  */
 async deleteMutual(mutualId: string): Promise<Mutual> {
   return await this.mutualModel.findByIdAndRemove(mutualId).exec();
 }


  /**
   * Elimina un mutual por el par de userIds.
   * #param id1 ID del primer usuario/personaje.
   * #param id2 ID del segundo usuario/personaje.
   * #returns El mutual eliminado.
   */
  async deleteMutualByPair(id1: string, id2: string): Promise<Mutual> {
    // Buscar el mutual por el par de userIds
    const mutual = await this.mutualModel.findOne({
      $or: [
        { id1: id1, id2: id2 },
        { id1: id2, id2: id1 },
      ],
    }).exec();

    if (!mutual) {
      throw new Error('Mutual no encontrado');
    }

    // Eliminar el mutual encontrado
    return await mutual.remove();
  }
}