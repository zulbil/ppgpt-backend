import {S3Client, PutObjectCommand, GetObjectCommand, HeadObjectCommand} from '@aws-sdk/client-s3';
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { streamToString } from "./utils.mjs";

const region        = process.env.REGION;
const bucketName    = process.env.BUCKET_NAME;

const s3Client        = new S3Client({ region });
const expirationTime  = 360000; // 5 minutes


export const checkFileExists = async (Key) => {
    try {
      const headParams = {
        Bucket: bucketName,
        Key
      };

      await s3Client.send(new HeadObjectCommand(headParams));
      return true;
    } catch (error) {
      console.log('Error:', error);
      return false;
    }
}

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

export const readFromFile = async (Key) => {
  try {
    const getObjectParams = {
      Bucket: bucketName,
      Key
    };
    const data = await s3Client.send(new GetObjectCommand(getObjectParams));
    return await streamToString(data.Body);
  } catch (error) {
    console.log('Error when reading from the file:', error);
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

