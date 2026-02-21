import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Patch, Body } from '@nestjs/common';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiOperation({ summary: 'List all users (admin only ideally)' })
  findAll(@Req() req: any) {
    return this.usersService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Patch('profile')
  @ApiOperation({ summary: 'Update logged-in user profile' })
  updateProfile(
    @Req() req: any,
    @Body() body: { name?: string; mobile?: string },
  ) {
    const userId = req.user.userId || req.user.sub;
    return this.usersService.updateProfile(userId, body);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiOperation({ summary: 'Get current logged-in user info' })
  me(@Req() req: any) {
    return req.user;
  }
}
