import { Injectable } from '@nestjs/common';
import * as AWS from 'aws-sdk';

@Injectable()
export class CloudflareR2Service {
  private readonly s3: AWS.S3;

  constructor() {
    this.s3 = new AWS.S3({
      endpoint:
        'https://7076bb96d38b123ec74a7843bc674a94.r2.cloudflarestorage.com',
      accessKeyId: '19a540922418d853bc6d5c2ea718af42',
      secretAccessKey:
        '6daba495571abb4bffeb51ca649b9793df2ac71290964692a599c859f84ad921',
      region: 'auto',
      s3ForcePathStyle: true,
      signatureVersion: 'v4',
    });
  }

  async uploadFile(
    bucketName: string,
    key: string,
    body: Buffer | string,
    contentType: string,
  ) {
    const params = {
      Bucket: bucketName,
      Key: key,
      Body: body,
      ContentType: contentType,
    };

    return this.s3.upload(params).promise();
  }

  async getFile(bucketName: string, key: string) {
    const params = {
      Bucket: bucketName,
      Key: key,
    };

    return this.s3.getObject(params).promise();
  }

  // Add more methods as needed
}
