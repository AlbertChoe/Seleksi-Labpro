import { Injectable } from '@nestjs/common';
import * as AWS from 'aws-sdk';

@Injectable()
export class CloudflareR2Service {
  private readonly s3: AWS.S3;
  private readonly bucketName: string;

  constructor() {
    this.s3 = new AWS.S3({
      endpoint: process.env.CLOUDFLARE_R2_ENDPOINT,
      accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID,
      secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY,
      region: 'auto',
      s3ForcePathStyle: true,
      signatureVersion: 'v4',
    });
    this.bucketName = process.env.CLOUDFLARE_R2_BUCKET_NAME;
  }

  async uploadFile(key: string, body: Buffer | string, contentType: string) {
    const params = {
      Bucket: this.bucketName,
      Key: key,
      Body: body,
      ContentType: contentType,
    };

    return this.s3.upload(params).promise();
  }

  async getFile(key: string) {
    const params = {
      Bucket: this.bucketName,
      Key: key,
    };

    return this.s3.getObject(params).promise();
  }

  async deleteFile(url: string) {
    const key = url.split('/').pop();
    const params = {
      Bucket: this.bucketName,
      Key: key,
    };
    return this.s3.deleteObject(params).promise();
  }
}
