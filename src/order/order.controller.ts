import {Body,Controller,Get,Param,Post,Req,UseGuards,UseInterceptors,UploadedFile,BadRequestException} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { plainToInstance } from 'class-transformer';
import { validateOrReject } from 'class-validator';

import { OrderService } from './order.service';
import { CheckoutDto } from './dto/checkout.dto';

@Controller('orders')
@UseGuards(AuthGuard('jwt'))
export class OrderController {
  constructor(private readonly orderService: OrderService) { }

  /* ================= ADMIN ROUTES (MUST BE FIRST) ================= */

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
    fileFilter: (req, file, cb) => {
      if (!file.mimetype.startsWith('image/')) {
        return cb(
          new BadRequestException('Only image files allowed'),
          false,
        );
      }
      cb(null, true);
    },
  }),
)
async checkout(
  @Req() req: any,
  @Body('shippingAddress') shippingAddressRaw: string,
  @Body('paymentMethod') paymentMethod: 'COD' | 'ONLINE',
  @Body('upiTxnId') upiTxnId?: string, // ✅ NEW FIELD
  @UploadedFile() paymentScreenshot?: Express.Multer.File,
) {
  const userId = req.user?.userId || req.user?.sub;
  if (!userId) {
    throw new BadRequestException('User not authenticated');
  }

  let dto: CheckoutDto;

  try {
    dto = plainToInstance(CheckoutDto, {
      shippingAddress: JSON.parse(shippingAddressRaw),
      paymentMethod,
    });

    await validateOrReject(dto, {
      whitelist: true,
      forbidNonWhitelisted: true,
    });
  } catch (err) {
    throw new BadRequestException(err);
  }

  if (dto.paymentMethod === 'ONLINE') {
    if (!paymentScreenshot) {
      throw new BadRequestException(
        'Payment screenshot is required for ONLINE orders',
      );
    }

    if (!upiTxnId) {
      throw new BadRequestException(
        'UPI Transaction ID is required for ONLINE orders',
      );
    }
  }

  return this.orderService.createOrder(userId,req.user.name,req.user.email,dto,paymentScreenshot,upiTxnId, // ✅ PASS TO SERVICE
  );
}

  /* ================= USER ORDERS ================= */

  @Get()
  async list(@Req() req: any) {
    const userId = req.user?.userId || req.user?.sub;
    return this.orderService.getOrdersForUser(userId);
  }

  /* ================= MUST BE LAST ================= */

  @Get(':orderId')
  async get(@Req() req: any, @Param('orderId') orderId: string) {
    const userId = req.user?.userId || req.user?.sub;
    return this.orderService.getOrder(userId, orderId);
  }
}
