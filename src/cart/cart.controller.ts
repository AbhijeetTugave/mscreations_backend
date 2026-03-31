import {Body,Controller,Get,Post,Req,UseGuards,UnauthorizedException,Query,} from '@nestjs/common';
import { CartService } from './cart.service';
import { AuthGuard } from '@nestjs/passport';
import { AddCartDto } from './dto/add-cart.dto';
import { SyncCartDto } from './dto/sync-cart.dto';


@Controller('cart')
@UseGuards(AuthGuard('jwt'))
export class CartController {
  constructor(private readonly cartService: CartService) { }

  private getUser(req: any) {
    if (!req.user) throw new UnauthorizedException();
    return req.user.userId;
  }

  @Get()
  async getCart(@Req() req: any) {
    const cart = await this.cartService.getCart(this.getUser(req));
    return { items: cart.items };
  }

  @Post('add')
  async add(@Req() req: any, @Body() dto: AddCartDto) {
    const cart = await this.cartService.addItem(this.getUser(req), dto);
    return { items: cart.items };
  }

  @Post('sync')
  async sync(@Req() req: any, @Body() dto: SyncCartDto) {
    const cart = await this.cartService.syncCart(
      this.getUser(req),
      dto.items,
      dto.force,
    );
    return { items: cart.items };
  }

  @Post('clear')
  async clear(
    @Req() req: any,
    @Query('delete') deleteFlag?: string,
  ) {
    return this.cartService.clearCart(
      this.getUser(req),
      deleteFlag === 'true',
    );
  }
}
