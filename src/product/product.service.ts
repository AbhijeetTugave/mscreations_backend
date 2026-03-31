import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product } from './schema/product.schema';
import cloudinary from 'src/config/cloudinary.config';


@Injectable()
export class ProductService {

  constructor(@InjectModel(Product.name) private productModel: Model<Product>) { }

  create(data) {
    return this.productModel.create(data);
  }

  findAll(query) {
    const filter: any = {};

    if (query.category) {
      filter.category = query.category;
    }

    return this.productModel.find(filter).exec();
  }


  findOne(id: string) {
    return this.productModel.findById(id);
  }

 async update(id: string, data) {
    const product = await this.productModel.findById(id);

  if (!product) {
    throw new Error('Product not found'); // ✅ FIX
  }

  if (data.images && product.images?.length) {
  for (const img of product.images) {
    if (img.public_id) {
      try {
        await cloudinary.uploader.destroy(img.public_id);
      } catch (err) {
        console.log('Cloudinary delete error:', err);
      }
    }
  }
}
    return this.productModel.findByIdAndUpdate(id, data, { new: true });
  }

 async delete(id: string) {
  const product = await this.productModel.findById(id);

  if (!product) {
    console.log('Product already deleted or not found');
    return null;
  }

  for (const img of product.images || []) {
    if (img.public_id) {
      try {
        await cloudinary.uploader.destroy(img.public_id);
      } catch (err) {
        console.log('Cloudinary delete error:', err);
      }
    }
  }

  return this.productModel.findByIdAndDelete(id);
}
}
