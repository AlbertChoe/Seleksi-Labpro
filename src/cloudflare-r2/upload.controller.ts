import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  Get,
  Param,
  Res,
  Logger,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudflareR2Service } from './cloudflare-r2.service';
import { Response } from 'express';
import { Readable } from 'stream';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiConsumes,
} from '@nestjs/swagger';

@ApiTags('files')
@Controller('files')
export class UploadController {
  private readonly logger = new Logger(UploadController.name);

  constructor(private readonly cloudflareR2Service: CloudflareR2Service) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload a file to Cloudflare R2 storage' })
  @ApiBody({
    description: 'File to upload',
    type: 'multipart/form-data',
  })
  @ApiResponse({
    status: 200,
    description: 'File uploaded successfully',
    schema: {
      example: {
        status: 'success',
        message: 'File uploaded successfully',
        data: {
          Location: 'https://example-bucket.r2.dev/filename',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'File upload failed',
    schema: {
      example: {
        status: 'error',
        message: 'File upload failed',
        error: 'Detailed error message',
      },
    },
  })
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    const result = await this.cloudflareR2Service.uploadFileMultipart(
      file.originalname,
      file.buffer,
    );
    return result;
  }

  @Get(':key')
  @ApiOperation({
    summary: 'Retrieve a file from Cloudflare R2 storage by its key',
  })
  @ApiResponse({
    status: 200,
    description: 'File fetched successfully',
    schema: {
      type: 'string',
      format: 'binary',
    },
  })
  @ApiResponse({
    status: 404,
    description: 'File not found',
    schema: {
      example: 'File not found',
    },
  })
  async getFile(@Param('key') key: string, @Res() res: Response) {
    this.logger.log(`Fetching file with key: ${key}`);
    try {
      const file = await this.cloudflareR2Service.getFile(key);
      const stream = file.Body as Readable;
      res.setHeader('Content-Type', file.ContentType);
      stream.pipe(res);
    } catch (error) {
      this.logger.error('Error fetching file:', error.stack);
      res.status(404).send('File not found');
    }
  }
}
