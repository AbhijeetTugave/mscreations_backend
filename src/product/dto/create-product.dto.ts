import { ApiProperty } from '@nestjs/swagger';

export class CreateProductDto {

  @ApiProperty()
  productName: string;

  @ApiProperty()
  category: string;

  @ApiProperty()
  subcategory: string;

  @ApiProperty()
  productType: string;

  @ApiProperty({ required: false })
  brand?: string;

  @ApiProperty()
  mrp: number;

  @ApiProperty()
  sellingPrice: number;

  @ApiProperty({ required: false })
  discount?: string;

  @ApiProperty()
  stock: number;

  @ApiProperty({ required: false })
  status?: string;

  @ApiProperty({ type: [String], required: false })
  size?: string[];

  @ApiProperty({ required: false })
  shortDesc?: string;

  @ApiProperty({ type: [String], required: false })
  images?: string[];
}
