import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ProductDocument = HydratedDocument<Product>;

@Schema({ timestamps: true })
export class Product {
  @Prop({ required: true })
  productName: string;

  @Prop()
  category: string;

  @Prop()
  subcategory: string;

  @Prop()
  productType: string;

  @Prop()
  brand: string;

  @Prop()
  mrp: number;

  @Prop()
  sellingPrice: number;

  @Prop()
  discount: string;

  @Prop()
  stock: number;

  @Prop()
  lowStock: number;

  @Prop()
  status: string;

  @Prop([String])
  size: string[];

  @Prop()
  shortDesc: string;

  @Prop([String])
  images: string[];
}

export const ProductSchema = SchemaFactory.createForClass(Product);
