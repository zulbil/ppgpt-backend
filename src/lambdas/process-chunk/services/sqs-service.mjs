import { SQSClient, SendMessageBatchCommand, DeleteMessageCommand, ReceiveMessageCommand } from "@aws-sdk/client-sqs";

const region        = process.env.REGION
const queueUrl      = process.env.QUEUE_URL

const sqsClient     = new SQSClient({ region });

export const deleteMessage = async (receiptHandle) => {
    try {
        const deleteParams = {
            QueueUrl: queueUrl,
            ReceiptHandle: receiptHandle
        };
        await sqsClient.send(new DeleteMessageCommand(deleteParams));
        console.log(`Message ${receiptHandle} deleted from queue`);
    } catch (error) {
        console.log('Error when deleting the message:', error);
        throw error;
    }
}

export const checkIfMessageExists = async (email, uid) => {
    try {
        const receiveMessageParams = {
            QueueUrl: queueUrl,
            AttributeNames: ["All"],
            //MessageAttributeNames: ["email", "uid"],
            MaxNumberOfMessages: 1,
            VisibilityTimeout: 20,
            WaitTimeSeconds: 0
        };
        const data = await sqsClient.send(new ReceiveMessageCommand(receiveMessageParams));
        console.log('Message Exists:', data);
        if (data.Messages && data.Messages.length > 0) {
            const message = data.Messages[0];
            const messageEmail = message.MessageAttributes.email.StringValue;
            const messageUid = message.MessageAttributes.uid.StringValue;
            if (messageEmail === email && messageUid === uid) {
                return true;
            }
        }
        return false;
    } catch (error) {
        console.log('Error when checking if message exists:', error);
        throw error;
    }
}