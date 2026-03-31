import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Order, OrderSchema } from './schema/order.schema';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { Cart, CartSchema } from '../cart/schema/cart.schema';
import { Product, ProductSchema } from '../product/schema/product.schema'; // ✅ ADD THIS
import { AdminModule } from 'src/admin/admin.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Order.name, schema: OrderSchema },
      { name: Cart.name, schema: CartSchema },
      { name: Product.name, schema: ProductSchema }, // ✅ ADD THIS
    ]),
    AdminModule,
  ],
  controllers: [OrderController],
  providers: [OrderService],
})
export class OrderModule {}