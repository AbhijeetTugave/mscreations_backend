import { Injectable, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';

import { CreateUserDto } from './dto/create-user.dto';
import { User, UserDocument, UserRole } from './schema/user.schema';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
  ) { }

  async create(createUserDto: CreateUserDto): Promise<UserDocument> {

    // 🔴 CHECK EMAIL OR MOBILE
    const existingUser = await this.userModel.findOne({
      $or: [
        { email: createUserDto.email },
        { mobile: createUserDto.mobile }
      ]
    });

    if (existingUser) {
      if (existingUser.email === createUserDto.email) {
        throw new ConflictException('Email already registered');
      }
      if (existingUser.mobile === createUserDto.mobile) {
        throw new ConflictException('Mobile number already registered');
      }
    }

    // 🔐 HASH PASSWORD
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const createdUser = new this.userModel({
      name: createUserDto.name,
      email: createUserDto.email,
      mobile: createUserDto.mobile,
      password: hashedPassword,
      role: createUserDto.role || UserRole.USER,
      isUser: createUserDto.isUser ?? true,
    });

    return createdUser.save();
  }

  async findByEmail(email: string) {
    return this.userModel.findOne({ email }).exec();
  }

  async findByMobile(mobile: string) {
    return this.userModel.findOne({ mobile }).exec();
  }

  async findById(id: string) {
    return this.userModel.findById(id).exec();
  }

  async findAll(): Promise<User[]> {
    return this.userModel.find().exec();
  }

  async updatePassword(email: string, password: string) {
    return this.userModel.updateOne(
      { email },
      { $set: { password } }
    );
  }

  async updateProfile(
    userId: string,
    data: { name?: string; mobile?: string },
  ) {
    return this.userModel.findByIdAndUpdate(
      userId,
      data,
      { new: true },
    );
  }

}
