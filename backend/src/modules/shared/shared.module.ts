// shared.module.ts
import { Module } from '@nestjs/common';

// middlewares
import { AppGateway } from '../../midlewares/websocketGateway';

@Module({
  providers: [AppGateway],
  exports: [AppGateway], // Exporta el servicio para que otros módulos puedan usarlo
})
export class SharedModule {}