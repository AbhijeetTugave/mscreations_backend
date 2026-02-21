import { IsArray, IsOptional, IsBoolean } from 'class-validator';

export class SyncCartDto {
  @IsArray()
  items: any[];

  @IsOptional()
  @IsBoolean()
  force?: boolean;
}
