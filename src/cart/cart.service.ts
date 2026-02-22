import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { InjectModel as InjectProduct } from '@nestjs/mongoose';
import { Product, ProductDocument } from '../product/schema/product.schema';
import { Cart, CartItem } from './schema/cart.schema';

@Injectable()
export class CartService {
  constructor(
    @InjectModel(Cart.name) private cartModel: Model<Cart>,
    @InjectProduct(Product.name) private productModel: Model<ProductDocument>,
  ) { }

  /* GET CART */
  async getCart(userId: string) {
    let cart = await this.cartModel.findOne({ userId });

    if (!cart) {
      cart = await this.cartModel.create({ userId, items: [] });
    }

    return cart;
  }

  /* ADD ITEM */
  async addItem(userId: string, dto: any) {
    const qty = Number(dto.quantity);
    if (isNaN(qty) || qty <= 0)
      throw new BadRequestException('Invalid quantity');

    const product = await this.productModel.findById(dto.productId);
    if (!product) throw new BadRequestException('Product not found');

    const cart = await this.getCart(userId);

    const size = dto.size || '';
    const color = dto.color || '';

    const index = cart.items.findIndex(
      i =>
        i.productId === dto.productId &&
        i.size === size &&
        i.color === color,
    );

    if (index >= 0) {
      cart.items[index].quantity += qty;
    } else {
      const newItem: CartItem = {
        productId: product._id.toString(),
        name: product.productName,
        brand: product.brand || '',
        price: product.sellingPrice,
        image: product.images?.[0] || '',
        quantity: qty,
        size,
        color,
      };

      cart.items.push(newItem);
    }

    cart.markModified('items');
    await cart.save();

    return cart;
  }

  /* SYNC CART */
  async syncCart(userId: string, items: CartItem[], force = false) {
    if (!Array.isArray(items))
      throw new BadRequestException('Items must be array');

    if (items.length === 0 && !force)
      return this.getCart(userId);

    return this.cartModel.findOneAndUpdate(
      { userId },
      { items },
      { new: true, upsert: true },
    );
  }

  /* CLEAR CART */
  async clearCart(userId: string, deleteDoc = false) {
    if (deleteDoc) {
      await this.cartModel.deleteOne({ userId });
      return { message: 'Cart deleted' };
    }

    const cart = await this.cartModel.findOne({ userId });

    if (!cart) return { message: 'No cart found' };

    // AUTO DELETE instead of empty
    await this.cartModel.deleteOne({ userId });

    return { message: 'Cart deleted' };
  }

}
