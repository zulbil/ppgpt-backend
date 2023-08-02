import { sendNotification } from './services/notification-service.mjs';
import { getS3Object } from './services/s3-service.mjs';
import { sendBatchToQueue } from './services/sqs-service.mjs';
import { chunkArray } from './services/utils.mjs';

const BATCH_SIZE    = process.env.BATCH_SIZE || 10;

/**
 *
 * Event doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html#api-gateway-simple-proxy-for-lambda-input-format
 * @param {Object} event - API Gateway Lambda Proxy Input Format
 *
 * Context doc: https://docs.aws.amazon.com/lambda/latest/dg/nodejs-prog-model-context.html 
 * @param {Object} context
 *
 * Return doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html
 * @returns {Object} object - API Gateway Lambda Proxy Output Format
 * 
 */

export const lambdaHandler = async (event) => {
    try {
        console.log('Lambda function started');
        console.log('Event: ', JSON.stringify(event));

        const s3Event = event.Records[0].s3;
        const s3Params = {
            Bucket: s3Event.bucket.name,
            Key: s3Event.object.key
        };

        const {jsonData, Metadata} = await getS3Object(s3Params);

        console.log('Splitting data into batches');
        const chunks = chunkArray(jsonData.data, BATCH_SIZE);
        console.log('Chunks:', JSON.stringify(chunks));
        console.log('Sending batches to SQS');
        const sendOperations = chunks.map((chunk, index) => sendBatchToQueue(chunk, index, Metadata));
        
        await Promise.all(sendOperations.map(operation => operation));
        console.log('All batches sent successfully');

        await sendNotification(Metadata, jsonData.data[0]);
        console.log('Notification Email sent successfully to the end user');
        
        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'JSON data sent to SQS' }),
        };
    } catch (err) {
        console.error('Error processing event :',err);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Internal Server Error' }),
        }
    }
};
