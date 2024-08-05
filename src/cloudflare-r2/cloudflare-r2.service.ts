import { Injectable } from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  CreateMultipartUploadCommand,
  UploadPartCommand,
  CompleteMultipartUploadCommand,
} from '@aws-sdk/client-s3';
import { GetObjectCommandOutput } from '@aws-sdk/client-s3';
import { Readable } from 'stream';

@Injectable()
export class CloudflareR2Service {
  private readonly s3Client: S3Client;
  private readonly bucketName: string;
  private readonly publicBaseUrl: string;

  constructor() {
    this.s3Client = new S3Client({
      endpoint: process.env.CLOUDFLARE_R2_ENDPOINT,
      credentials: {
        accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY,
      },
      region: 'auto',
      forcePathStyle: true,
    });
    this.bucketName = process.env.CLOUDFLARE_R2_BUCKET_NAME;
    this.publicBaseUrl = process.env.CLOUDFLARE_R2_PUBLIC_BASE_URL;
  }

  async uploadFileMultipart(
    key: string,
    body: Buffer | string,
  ): Promise<string> {
    const createCommand = new CreateMultipartUploadCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    const uploadResponse = await this.s3Client.send(createCommand);
    const uploadId = uploadResponse.UploadId;

    const partSize = 5 * 1024 * 1024; // 5MB
    const parts = [];
    for (let start = 0; start < body.length; start += partSize) {
      const partBody = body.slice(start, start + partSize);
      const partCommand = new UploadPartCommand({
        Bucket: this.bucketName,
        Key: key,
        PartNumber: parts.length + 1,
        UploadId: uploadId,
        Body: partBody,
      });
      const partResponse = await this.s3Client.send(partCommand);
      parts.push({ ETag: partResponse.ETag, PartNumber: parts.length + 1 });
    }

    const completeCommand = new CompleteMultipartUploadCommand({
      Bucket: this.bucketName,
      Key: key,
      UploadId: uploadId,
      MultipartUpload: { Parts: parts },
    });

    await this.s3Client.send(completeCommand);
    return `${this.publicBaseUrl}/${key}`;
  }

  async getFile(key: string): Promise<GetObjectCommandOutput> {
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    return this.s3Client.send(command);
  }

  async deleteFile(url: string): Promise<void> {
    const key = url.split('/').pop();
    const command = new DeleteObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    await this.s3Client.send(command);
  }
}
