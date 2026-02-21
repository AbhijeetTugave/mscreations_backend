import {IsNotEmpty,IsObject,IsString,ValidateNested,IsIn,} from 'class-validator';
import { Type } from 'class-transformer';

export class AddressDto {
  @IsNotEmpty({ message: 'Full name is required' })
  @IsString()
  fullName: string;

  @IsNotEmpty({ message: 'Mobile number is required' })
  @IsString()
  mobile: string;

  @IsNotEmpty({ message: 'Address line 1 is required' })
  @IsString()
  addressLine1: string;

  @IsString()
  addressLine2?: string;

  @IsNotEmpty({ message: 'City is required' })
  @IsString()
  city: string;

  @IsNotEmpty({ message: 'State is required' })
  @IsString()
  state: string;

  @IsNotEmpty({ message: 'Postal code is required' })
  @IsString()
  postalCode: string;

  @IsString()
  country?: string;
}

export class CheckoutDto {
  @ValidateNested()
  @Type(() => AddressDto)
  @IsObject({ message: 'shippingAddress must be an object' })
  shippingAddress: AddressDto;

  @IsNotEmpty({ message: 'Payment method is required' })
  @IsString()
  @IsIn(['COD', 'ONLINE'], {
    message: 'paymentMethod must be COD or ONLINE',
  })
  paymentMethod: 'COD' | 'ONLINE';
}
