import { GetObjectCommand, S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { streamToString } from './utils.mjs';

const region            =   process.env.REGION
const s3Client          =   new S3Client({ region });
const bucketName        =   'ppgpt-bucket';
const expirationTime    =   24 * 60 * 60; // 24 hours

export const getS3Object = async (s3Params) => {
    try {
        const command = new GetObjectCommand(s3Params);
        const response = await s3Client.send(command);
        const { Body, Metadata } = response;
        const streamBody = await streamToString(Body);
        const jsonData = JSON.parse(streamBody.trim(''));
        console.log('Printing JSON file content:', JSON.stringify(jsonData));
        return { jsonData, Metadata };
    } catch (error) {
        console.error('Error getting S3 object:', JSON.stringify(error.message));
    }
};

export const writeToFile = async (Key, Body, Metadata) => {
    try {
      const putObjectParams = {
          Bucket: bucketName,
          Key,
          Body,
          Metadata
      };
      console.log('Writing data to the file...');
      await s3Client.send(new PutObjectCommand(putObjectParams));
      console.log('Data written to the file successfully...');
    } catch (error) {
      console.log('Error when writing to the file:', error);
      throw error;
    }
}

export const generateSignedUrl = async (objectKey) => {
    try {
      const command = new GetObjectCommand({
        Bucket: bucketName,
        Key: objectKey,
      });
      
      const signedUrl = await getSignedUrl(s3Client, command, {
        expiresIn: expirationTime, // Time in seconds until the URL expires
      });
    
      return signedUrl;
    } catch (error) {
      console.error('Error generating signed URL:', error);
      throw error;
    }
}
