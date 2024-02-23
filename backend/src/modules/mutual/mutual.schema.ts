// mutual.model.ts
import { Prop, Schema, SchemaFactory, MongooseModule } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ versionKey: '_vk' })
export class Mutual extends Document {
  @Prop({ required: true, type: String }) id1: string;
  @Prop({ required: true, type: String }) id2: string;
  @Prop({ required: true, type: String }) relationshipType: string; 
  @Prop({ default: 'pending' }) status: string;
}

export type MutualDocument = Mutual & Document;
export const MutualSchema = SchemaFactory.createForClass(Mutual);

MutualSchema.index({ id1: 1, id2: 1 }, { unique: true }); // Índice compuesto para userId1 y userId2

export const MutualFeatured = MongooseModule.forFeature([ 
  { name: Mutual.name, schema: MutualSchema }
]);