import { PartialType } from '@nestjs/swagger';
import { CreateProductDto } from 'src/product/dto/create-product.dto';


export class UpdateProductDto extends PartialType(CreateProductDto) { }
