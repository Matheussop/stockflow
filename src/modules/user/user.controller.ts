import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';

import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { CreateUserDto } from './dto/create-user.dto';
import { UserService } from './user.service';
import { User } from '../auth/decorators/user.decorator';
import type { JwtPayload } from 'src/modules/auth/interfaces/jwt-payload.interface';
import { Role } from '@prisma/client';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';

@ApiTags('Users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ status: 201, description: 'User successfully created' })
  @Post()
  create(@Body() dto: CreateUserDto) {
    return this.userService.create(dto);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'List all user' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get()
  findAll() {
    return this.userService.findAll();
  }
}
