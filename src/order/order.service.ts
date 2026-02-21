import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, OrderDocument } from './schema/order.schema';
import { Cart } from '../cart/schema/cart.schema';
import { CheckoutDto } from './dto/checkout.dto';
import { AdminGateway } from '../admin/admin.gateway';

@Injectable()
export class OrderService {
  constructor(
    @InjectModel(Order.name) private readonly orderModel: Model<OrderDocument>,
    @InjectModel(Cart.name) private readonly cartModel: Model<Cart>,
    private readonly adminGateway: AdminGateway,
  ) { }

  private generateOrderId() {
    return `ORD-${Date.now().toString(36).toUpperCase()}`;
  }

  // ================= CREATE ORDER =================
async createOrder(
  userId: string,
  userName: string,
  userEmail: string,
  dto: CheckoutDto,
  paymentScreenshot?: Express.Multer.File,
  upiTxnId?: string,
  upiNote?: string,
) {
  const cart = await this.cartModel.findOne({ userId });

  if (!cart || !cart.items.length) {
    throw new BadRequestException('Cart is empty');
  }

  const total = cart.items.reduce((sum, item: any) => {
    const price =
      item.sellingPrice ??
      item.price ??
      item.product?.sellingPrice ??
      0;

    const qty = item.quantity ?? 1;

    return sum + price * qty;
  }, 0);

  const order = await this.orderModel.create({
    orderId: this.generateOrderId(),
    userId,
    userName,
    userEmail,
    items: cart.items,
    total,
    shippingAddress: dto.shippingAddress,
    paymentMethod: dto.paymentMethod,
    paid: false,
    status: 'pending',
    paymentStatus:
      dto.paymentMethod === 'ONLINE'
        ? 'verification_pending'
        : 'pending',
    meta: {
  paymentScreenshot: paymentScreenshot
    ? `${process.env.APP_URL}/uploads/payments/${paymentScreenshot.filename}`
    : null,
  upiTxnId: upiTxnId || null,
  upiNote: upiNote || null,
  paymentSubmittedAt: new Date(),
},
  });

  await this.cartModel.updateOne(
    { userId },
    { $set: { items: [] } },
  );

  return order;
}


  // ================= USER ORDERS =================
  async getOrdersForUser(userId: string) {
    return this.orderModel.find({ userId }).sort({ createdAt: -1 });
  }

  async getOrder(userId: string, orderId: string) {
    const order = await this.orderModel.findOne({ userId, orderId });
    if (!order) {
      throw new BadRequestException('Order not found');
    }
    return order;
  }

  // ================= ADMIN ORDERS =================
  async getAllOrders() {
    return this.orderModel.find().sort({ createdAt: -1 });
  }

  async updateOrderAdmin(
    orderId: string,
    updates: { status?: string; paymentStatus?: string },
  ) {
    const order = await this.orderModel.findOne({ orderId });

    if (!order) {
      throw new BadRequestException('Order not found');
    }

    if (updates.status) {
      order.status = updates.status;
    }

    if (updates.paymentStatus) {
      order.paymentStatus = updates.paymentStatus;
      order.paid = updates.paymentStatus === 'paid';
    }

    await order.save();
    return order;
  }

}
