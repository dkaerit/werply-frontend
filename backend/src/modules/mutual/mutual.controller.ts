// src/characters/controllers/characters.controller.ts
import { Controller, Get, Delete, Post, Body, Param, Query } from '@nestjs/common';
import { MutualService } from './mutual.service';
import { Mutual } from './mutual.schema';
import { CreateMutualDto } from './mutual.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiBearerAuth()
@ApiTags('mutuals')
@Controller('mutuals')
export class MutualController {
  constructor(private readonly mutualService: MutualService) { }

  /**
   * Endpoint para obtener todos los registros de mutuals.
   * #returns Lista de mutuals.
   */
  @Get()
  getAllMutuals(): Promise<Mutual[]> {
    return this.mutualService.getAllMutuals();
  }

  /**
   * Endpoint para obtener todos los mutuals de un usuario específico.
   * #param id ID del usuario para el cual se obtienen los mutuals.
   * #returns Lista de mutuals del usuario.
   */
  @Get('id:id')
  getUserMutuals(@Param('id') id: string): Promise<Mutual[]> {
    id = id.replace(':', '');
    return this.mutualService.getUserMutuals(id);
  }

  /**
   * Endpoint para crear un nuevo mutual.
   * #param createMutualDto Datos para crear un mutual.
   * #returns El mutual creado.
   */
  @Post('create')
  createMutual(@Body() createMutualDto: CreateMutualDto): Promise<Mutual> {
    return this.mutualService.createMutual(createMutualDto);
  }

  /**
   * Endpoint para eliminar un mutual.
   * #param mutualId ID del mutual a eliminar.
   * #returns El mutual eliminado.
   */
  @Delete('delete/id:mutualId')
  deleteMutual(@Param('mutualId') mutualId: string): Promise<Mutual> {
    mutualId = mutualId.replace(':', '');
    return this.mutualService.deleteMutual(mutualId);
  }

  /**
   * Endpoint para eliminar un mutual por el par de userIds.
   * #param query Objeto de consulta con userId1 y userId2.
   * #returns El mutual eliminado.
   */
  @Delete('delete/pair')
  deleteMutualByPair(@Query() query: { id1: string; id2: string }): Promise<Mutual> {
    return this.mutualService.deleteMutualByPair(query.id1, query.id2);
  }
}