import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product } from './schema/product.schema';

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

  update(id: string, data) {
    return this.productModel.findByIdAndUpdate(id, data, { new: true });
  }

  delete(id: string) {
    return this.productModel.findByIdAndDelete(id);
  }
}
