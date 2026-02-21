// src/order/schema/order.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type OrderDocument = HydratedDocument<Order>;

export class OrderItem {
  @Prop()
  _id: string;

  @Prop()
  productName: string;

  @Prop()
  sellingPrice: number;

  @Prop()
  quantity: number;

  @Prop()
  selectedSize?: string;

  @Prop({ type: [String], default: [] })
  images?: string[];
}

@Schema({ timestamps: true })
export class Order {
  @Prop({ required: true })
  orderId: string;

  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  userName: string;

  @Prop()
  userEmail?: string;

  @Prop({ type: [Object], default: [] })
  items: OrderItem[];

  @Prop({ required: true })
  total: number;

  @Prop({ type: Object, required: true })
  shippingAddress: {
    fullName: string;
    mobile: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    postalCode: string;
    country?: string;
  };

  @Prop({ required: true })
  paymentMethod: string;

  @Prop({ default: false })
  paid: boolean;

  @Prop({ default: 'pending' })
  status: string;

  @Prop({ default: 'pending' })
  paymentStatus: string;

  @Prop({ type: Object, default: {} })
  meta: any;

  // ✅ TIMESTAMPS (VERY IMPORTANT)
  createdAt: Date;
  updatedAt: Date;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
