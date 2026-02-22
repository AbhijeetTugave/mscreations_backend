import {
  Controller,
  Get,
  UseGuards,
  Req,
  Patch,
  Body,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiOperation({ summary: 'List all users (admin only ideally)' })
  findAll() {
    return this.usersService.findAll();
  }

  // ✅ UPDATE PROFILE (name + mobile + address)
  @UseGuards(JwtAuthGuard)
  @Patch('profile')
  @ApiOperation({ summary: 'Update logged-in user profile' })
  async updateProfile(
    @Req() req: any,
    @Body() body: any,
  ) {
    const userId = req.user.userId || req.user.sub;
    return this.usersService.updateProfile(userId, body);
  }

  // ✅ GET FULL USER FROM DATABASE
  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiOperation({ summary: 'Get current logged-in user info' })
  async me(@Req() req: any) {
    const userId = req.user.userId || req.user.sub;
    return this.usersService.findById(userId);
  }
}