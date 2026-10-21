import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  Req,
  UseGuards,
  UseInterceptors,
  UseFilters,
  UploadedFiles,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { Request } from 'express';
import { randomUUID } from 'crypto';
import * as path from 'path';
import { CurrentUserGuard } from '../auth/current-user.guard';
import { ListingsService } from './listings.service';
import { CreateListingDto } from './dto/create-listing.dto';
import { UpdateListingDto } from './dto/update-listing.dto';
import { ListingsQueryDto } from './dto/listings-query.dto';
import { config } from '../config';
import { MulterExceptionFilter } from './multer-exception.filter';
import * as fs from 'fs';

const ALLOWED_MIMES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

@Controller('listings')
export class ListingsController {
  constructor(private readonly listingsService: ListingsService) {}

  @Get()
  findAll(@Query() query: ListingsQueryDto) {
    return this.listingsService.findPublished(query.city);
  }

  @Get('mine')
  @UseGuards(CurrentUserGuard)
  findMine(@Req() req: Request) {
    return this.listingsService.findMine((req as any).user.id);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: Request,
  ) {
    const userId = req.headers['x-user-id'] as string | undefined;
    return this.listingsService.findOne(id, userId);
  }

  @Post()
  @UseGuards(CurrentUserGuard)
  create(@Body() dto: CreateListingDto, @Req() req: Request) {
    return this.listingsService.create(dto, (req as any).user.id);
  }

  @Patch(':id')
  @UseGuards(CurrentUserGuard)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateListingDto,
    @Req() req: Request,
  ) {
    return this.listingsService.update(id, dto, (req as any).user.id);
  }

  @Delete(':id')
  @UseGuards(CurrentUserGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: Request,
  ) {
    return this.listingsService.remove(id, (req as any).user.id);
  }

  @Post(':id/photos')
  @UseGuards(CurrentUserGuard)
  @UseFilters(new MulterExceptionFilter())
  @UseInterceptors(
    FilesInterceptor('photos', 10, {
      storage: diskStorage({
        destination: (_req, _file, cb) => {
          fs.mkdirSync(config.uploadDir, { recursive: true });
          cb(null, config.uploadDir);
        },
        filename: (_req, file, cb) => {
          const ext = path.extname(file.originalname).toLowerCase();
          cb(null, `${randomUUID()}${ext}`);
        },
      }),
      fileFilter: (_req, file, cb) => {
        if (!ALLOWED_MIMES.includes(file.mimetype)) {
          return cb(
            new BadRequestException(
              `Invalid file type: ${file.mimetype}. Only JPEG, PNG and WebP are allowed`,
            ),
            false,
          );
        }
        cb(null, true);
      },
      limits: { fileSize: MAX_FILE_SIZE },
    }),
  )
  async addPhotos(
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFiles() files: Express.Multer.File[],
    @Req() req: Request,
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No photos provided');
    }
    return this.listingsService.addPhotos(id, (req as any).user.id, files);
  }

  @Delete(':id/photos/:photoId')
  @UseGuards(CurrentUserGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  removePhoto(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('photoId', ParseUUIDPipe) photoId: string,
    @Req() req: Request,
  ) {
    return this.listingsService.removePhoto(id, photoId, (req as any).user.id);
  }
}
