import { Configuration, OpenAIApi } from "openai";
import { SecretsManagerClient, GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";


const getOpenAIKey = async () => {
    try {
        const secretName = 'OpenAIAPISecret';
        const secretsManagerClient = new SecretsManagerClient({ region: process.env.REGION });

        const command = new GetSecretValueCommand({ SecretId: secretName });
        const secretValue = await secretsManagerClient.send(command);

        if ('SecretString' in secretValue) {
            const secret = JSON.parse(secretValue.SecretString);
            const openAIApiKey = secret.OPENAI_API_KEY;
            return openAIApiKey; 
        }
        return null;

    } catch (error) {
        console.log('Error getting OpenAI API Key:', error);
        return null;
    }
}


export const openAIRequest = async (prompt) => {
    try {
        const apiKey = await getOpenAIKey();
        const configuration = new Configuration({
            apiKey
          });
          
        const openai = new OpenAIApi(configuration);
        const response = await openai.createCompletion({
            model: "text-davinci-003",
            prompt,
            temperature: 0.9,
            max_tokens: 3000,
            top_p: 0.9, 
            frequency_penalty: 0,
            presence_penalty: 0
        });
        return response.data.choices[0].text; 
    } catch (error) {
        console.log(error);
        return null; 
    }
}