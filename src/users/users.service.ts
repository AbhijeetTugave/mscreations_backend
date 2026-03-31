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
  ) {}

  // ================= CREATE USER =================
  async create(createUserDto: CreateUserDto): Promise<UserDocument> {
    const existingUser = await this.userModel.findOne({
      $or: [
        { email: createUserDto.email },
        { mobile: createUserDto.mobile },
      ],
    });

    if (existingUser) {
      if (existingUser.email === createUserDto.email) {
        throw new ConflictException('Email already registered');
      }
      if (existingUser.mobile === createUserDto.mobile) {
        throw new ConflictException('Mobile number already registered');
      }
    }

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

  // ================= FIND METHODS =================
  async findByEmail(email: string) {
    return this.userModel.findOne({ email }).exec();
  }

  async findByMobile(mobile: string) {
    return this.userModel.findOne({ mobile }).exec();
  }

  async findById(id: string) {
    return this.userModel
      .findById(id)
      .select('-password') // 🔥 hide password
      .exec();
  }

  async findAll(): Promise<User[]> {
    return this.userModel.find().select('-password').exec();
  }

  // ================= UPDATE PASSWORD =================
  async updatePassword(email: string, password: string) {
    return this.userModel.updateOne(
      { email },
      { $set: { password } },
    );
  }

  // ================= UPDATE PROFILE =================
  async updateProfile(userId: string, data: any) {
    const updateData: any = {};

    // Basic fields
    if (data.name) updateData.name = data.name;
    if (data.mobile) updateData.mobile = data.mobile;

    // Address handling (create OR update)
    if (data.address) {
      updateData.address = {
        addressLine1: data.address.addressLine1 || '',
        addressLine2: data.address.addressLine2 || '',
        city: data.address.city || '',
        state: data.address.state || '',
        postalCode: data.address.postalCode || '',
        country: data.address.country || 'India',
      };
    }

    return this.userModel
      .findByIdAndUpdate(
        userId,
        { $set: updateData },
        { new: true },
      )
      .select('-password');
  }
}