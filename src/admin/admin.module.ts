import { Module } from '@nestjs/common';
import { AdminGateway } from './admin.gateway';

@Module({
  providers: [AdminGateway],
  exports: [AdminGateway], // ✅ VERY IMPORTANT
})
export class AdminModule { }
