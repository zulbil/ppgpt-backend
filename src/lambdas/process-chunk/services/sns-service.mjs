import { SNS, PublishCommand, SubscribeCommand } from '@aws-sdk/client-sns';

const region        =   process.env.REGION;
const TopicArn      =   process.env.SNS_TOPIC;

const snsClient     =   new SNS({ region });

const sendMessage = async (emailAddress, Subject, Message) => {
    try {
        const params = {
            TopicArn,
            Message,
            Subject
        };
        await snsClient.send(new PublishCommand(params));
        console.log(`Processing finished. Sending email to the user: ${emailAddress}`);
    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
}

const subscribeToTopic = async (emailAddress) => {
    const subscribeParams = {
      Protocol: 'email',
      TopicArn,
      Endpoint: emailAddress
    };
  
    try {
      await snsClient.send(new SubscribeCommand(subscribeParams));
      console.log(`Email address ${emailAddress} subscribed to the topic.`);
    } catch (error) {
      console.error('Error subscribing email address:', error);
      throw error;
    }
}

const checkSubscription = async (emailAddress) => {
    const listSubscriptionsParams = {
      TopicArn,
    };
  
    try {
      const response = await snsClient.listSubscriptionsByTopic(listSubscriptionsParams);
      const subscriptions = response.Subscriptions || [];
      return subscriptions.some(subscription => subscription.Endpoint === emailAddress);
    } catch (error) {
      console.error('Error checking subscription:', error);
      throw error;
    }
};

export const sendEmail = async (emailAddress, Subject, Message) => {
    try {
        const isSubscribed = await checkSubscription(emailAddress);
        if (!isSubscribed) {
            await subscribeToTopic(emailAddress);
            console.log(`Email address ${emailAddress} subscribed to the topic.`);
        }
        await sendMessage(emailAddress, Subject, Message);
    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
}
