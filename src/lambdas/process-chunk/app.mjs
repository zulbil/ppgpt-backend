import { openAIRequest } from "./services/openai-service.mjs";
import { appendDataToCsv } from "./services/csv-service.mjs";


// Purpose: Process a chunk of data from the SQS Queue
/**
 *
 * Event doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html#api-gateway-simple-proxy-for-lambda-input-format
 * @param {Object} event - API Gateway Lambda Proxy Input Format
 *
 * Return doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html
 * @returns {Object} object - API Gateway Lambda Proxy Output Format
 * 
 */


export const lambdaHandler = async (event) => {
    try {
        console.log('Triggering processChunk lambda ....');
        console.log('Event: ', JSON.stringify(event));

        const record = event.Records[0];

        const body = JSON.parse(record.body);
        const metadata = record.messageAttributes;
        const uid = metadata.uid['stringValue'];
        const email = metadata.email['stringValue'];
        console.log('Processing record:', record);

        const url = body['URL'];
        const tags = body['Tags'];
        const title = body['Current Page Title'];
        const metaDescription = body['Current Meta Description'];
        const prompt = body['Prompt'];

        const promptRequest = `
            URL : ${url}
            Tags : ${tags}
            Title : ${title}
            Meta Description : ${metaDescription}
            Prompt : ${prompt}
        `;

        const response  =   await openAIRequest(promptRequest);
        const data      =   { ...body, 'Open AI Response': response }

        console.log('Data to be appended to CSV:', data);

        await appendDataToCsv(data, { uid, email });
        
        return {
            statusCode: 200,
            message: JSON.stringify({ message: 'Chunk processed successfully' })
        }
    } catch (err) {
        console.error('Error processing chunk:', JSON.stringify(err.message));
        return {
            message: err.message,
            statusCode: 500
        }
    }
};
