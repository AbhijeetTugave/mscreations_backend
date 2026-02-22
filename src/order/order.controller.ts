import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';

import { OrderService } from './order.service';

@Controller('orders')
@UseGuards(AuthGuard('jwt'))
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  /* ================= ADMIN ROUTES ================= */

  @Get('admin/all')
  async getAllOrders() {
    return this.orderService.getAllOrders();
  }

  @Post('admin/update/:orderId')
  async updateOrderAdmin(
    @Param('orderId') orderId: string,
    @Body() body: { status?: string; paymentStatus?: string },
  ) {
    return this.orderService.updateOrderAdmin(orderId, body);
  }

  /* ================= USER CHECKOUT ================= */

  @Post('checkout')
  @UseInterceptors(
    FileInterceptor('paymentScreenshot', {
      storage: diskStorage({
        destination: './uploads/payments',
        filename: (req, file, cb) => {
          const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const safeName = file.originalname.replace(/\s+/g, '_');
          cb(null, `${unique}-${safeName}`);
        },
      }),
    }),
  )

  
  async checkout(
    @Req() req: any,
    @UploadedFile() paymentScreenshot: Express.Multer.File,
    @Body() body: any,
  ) {
    const userId = req.user?.userId || req.user?.sub;
    if (!userId) {
      throw new BadRequestException('User not authenticated');
    }

    const { shippingAddress, paymentMethod, upiTxnId, upiNote } = body;

    if (!shippingAddress) {
      throw new BadRequestException('Shipping address required');
    }

    const parsedAddress = JSON.parse(shippingAddress);

    return this.orderService.createOrder(
      userId,
      req.user.name,
      req.user.email,
      { shippingAddress: parsedAddress, paymentMethod },
      paymentScreenshot,
      upiTxnId,
      upiNote,
    );
  }

  /* ================= USER ORDERS ================= */

  @Get()
  async list(@Req() req: any) {
    const userId = req.user?.userId || req.user?.sub;
    return this.orderService.getOrdersForUser(userId);
  }

  @Get(':orderId')
  async get(@Req() req: any, @Param('orderId') orderId: string) {
    const userId = req.user?.userId || req.user?.sub;
    return this.orderService.getOrder(userId, orderId);
  }
}