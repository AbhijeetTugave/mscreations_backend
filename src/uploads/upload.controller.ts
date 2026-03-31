import { Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import cloudinary from 'src/config/cloudinary.config';
import { CloudinaryStorage } from 'multer-storage-cloudinary';


@Controller('upload')
export class UploadController {

  @Post()
  @UseInterceptors(FileInterceptor('image', {
    storage: new CloudinaryStorage({
      cloudinary: cloudinary,
      params: async (req, file) => {
        return {
          folder: 'products', // folder in cloudinary
          format: 'jpg',
          transformation: [
            { width: 1000, height: 1000, crop: 'limit' },
            { quality: 'auto:eco' } // 🔥 compress automatically
          ],
        };
      },
    }),
  }))
  upload(@UploadedFile() file: any) {
    return {
      url: file.path,          // cloudinary url
      public_id: file.filename // important for delete
    };
  }
}