import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../users/schema/user.schema';

@Injectable()
export class SeederService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) { }

  async seedAdmin() {
    const admin = await this.userModel.findOne({ email: 'mscreation@gmail.com' });
    if (admin) return;

    const hashed = await bcrypt.hash('Mscreation@123', 10);

    await this.userModel.create({
      name: 'Admin',
      email: 'mscreation@gmail.com',
      password: hashed,
      role: 'admin',
      isUser: false,
      isActive: true,
    });

    console.log('Admin seeded');
  }
}
