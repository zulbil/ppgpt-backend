import { SESClient, VerifyEmailIdentityCommand, ListIdentitiesCommand, SendEmailCommand } from "@aws-sdk/client-ses";

const region        =   process.env.REGION;
const sesClient     =   new SESClient({ region });

async function checkEmailVerificationStatus(emailAddress) {
    try {
      const command = new ListIdentitiesCommand({ IdentityType: "EmailAddress" });
      const response = await sesClient.send(command);
  
      if (response.Identities.includes(emailAddress)) {
        console.log(`Email address ${emailAddress} is already verified.`);
        return true;
      } 
      return false;
    } catch (error) {
      console.error("Error checking email verification status:", error);
      return false;
    }
}

async function verifyEmailAddress(emailAddress) {
    const params = {
      EmailAddress: emailAddress
    };
  
    const command = new VerifyEmailIdentityCommand(params);
  
    try {
      await sesClient.send(command);
      console.log(`Email address ${emailAddress} successfully submitted for verification.`);
    } catch (error) {
      console.error('Error verifying email address:', error);
      throw error;
    }
}

async function sendEmail(subject, message, emailAddress) {
    const params = {
      Destination: {
        ToAddresses: [emailAddress],
      },
      Message: {
        Body: {
          Html: {
            Data: message
          },
        },
        Subject: {
          Data: subject,
        },
      },
      Source: "joel.khang@decodeadvertising.com", // Replace with your verified SES email address
    };
  
    const command = new SendEmailCommand(params);
  
    try {
      const response = await sesClient.send(command);
      console.log("Email sent successfully:", response);
    } catch (error) {
      console.error("Error sending email:", error);
    }
}

export const sendEmailProcess = async (emailAddress, Subject, Message) => {
    try {
        // const isVerified = await checkEmailVerificationStatus(emailAddress);
        // if (!isVerified) {
        //     await verifyEmailAddress(emailAddress);
        //     console.log(`Email address ${emailAddress} successfully submitted for verification.`);
        // }
        console.log(`About to send a message to the email address ${emailAddress}...`)
        await sendEmail(Subject, Message, emailAddress);
        console.log(`Processing finished. Sending email to the user: ${emailAddress}`);
    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
}
  
  

