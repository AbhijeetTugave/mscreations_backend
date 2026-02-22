import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export interface CartItem {
  productId: string;
  name: string;
  brand:string;
  price: number;
  image: string;
  size?: string;
  color?: string;
  quantity: number;
}

@Schema({ timestamps: true })
export class Cart extends Document {
  @Prop({ required: true, index: true })
  userId: string;

  @Prop({
    type: [
      {
        productId: String,
        name: String,
        brand: String,
        price: Number,
        image: String,
        size: String,
        color: String,
        quantity: Number,
      },
    ],
    default: [],
  })
  items: CartItem[];
}

export const CartSchema = SchemaFactory.createForClass(Cart);
