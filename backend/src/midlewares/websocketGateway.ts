import { WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { TrackingInformationDto } from '../modules/auth/auth.dto';

@WebSocketGateway({ cors: true })
export class AppGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;
  private connectedUsers: Map<string, TrackingInformationDto> = new Map(); // Mapa de ID de usuario a ID de socket

  private getSocketIdByField(field: string, value: string): string | undefined { // actor puede ser o un pj o el user
    for (const [socketId, userData] of this.connectedUsers) {
      if (userData[field] === value) return socketId;
    }
    return undefined;
  }

  /**
   * Maneja la conexión de un cliente.
   * #param client Socket del cliente que se conecta.
   */
  handleConnection(client: Socket) {

    const query = client.handshake.query;

    this.connectedUsers.set(client.id, {
      "id": query.id,
      "owner": query.owner,
      "alias": query.alias,
      "type": query.type
    } as TrackingInformationDto); // Agregar el nuevo cliente al mapa con info de rastreo

    console.log('\x1b[32m[Sock] Cliente conectado:\x1b[0m', `${client.id}(socket) ${query.owner}(ownerid) ${query.id}(selected)`, query.alias, query.type);
  }

  /**
   * Maneja la desconexión de un cliente.
   * #param client Socket del cliente que se desconecta.
   */
  handleDisconnect(client: Socket) {
    const data = this.connectedUsers.get(client.id);
    this.connectedUsers.delete(client.id);
    console.log('\x1b[31m[Sock] Cliente desconect:\x1b[0m', `${client.id}(socket) ${data.owner}(ownerid) ${data.id}(selected)`, data.alias, data.type);
  }

  /**
   * Asocia un ID de usuario con un ID de socket.
   * #param userId ID de usuario.
   * #param socketId ID de socket.
   */
  associateUserWithSocket(data: TrackingInformationDto) {
    const socketId = this.getSocketIdByField("owner", data.owner);
    if (socketId) this.connectedUsers.set(socketId, data);
    console.log('\x1b[33m[Sock] Conexión cambiada:\x1b[0m', `${socketId}(socket) ${data.owner}(ownerid) ${data.id}(selected)`, data.alias, data.type);
  }

  /**
   * Envía una notificación a un cliente específico.
   * #param actorId ID del usuario o pj al que se enviará la notificación.
   * #param message Mensaje de la notificación.
   */
  sendNotificationToClient(selectedId: string, message: string, desc?:string) {
    const socketId = this.getSocketIdByField("alias", selectedId);
    if (socketId) this.server.to(socketId).emit(message, { desc });
  }

  /**
   * Envía una notificación a un canal específico.
   * #param channelId ID del canal.
   * #param message Mensaje de la notificación.
   */
  sendNotificationToMutuals(mutualIds: string[], message: string, authorId?: string, desc?:string) {
    const alias = Array.from(this.connectedUsers.values()).find(item => item.id === authorId)?.alias;
    console.log('[Sock] Notificación:', `(${message}) de`, alias);
    Array.from(this.connectedUsers.values()).forEach(user => {    
      if (mutualIds.includes(user.id)) {
        this.sendNotificationToClient(user.alias, message, desc);
        console.log('a', user.alias);
      }
    });  
  }


}