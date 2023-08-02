import { readFromFile, writeToFile, checkFileExists } from './s3-service.mjs';
import { Parser } from '@json2csv/plainjs';

export const appendDataToCsv = async (data, metadata) => {
    console.log('Appending data to the CSV file...');
    const uid = metadata.uid;
    const key = `output/output${uid}.csv`;
    try {
        const fileExists = await checkFileExists(key);
        let parser = new Parser({ header: !fileExists });
        let csvData = parser.parse(data);
        if (fileExists) {
            console.log(`The file does exist inside of the ouput folder...`);
            // Append data to the existing file
            const existingData = await readFromFile(key);
            let newData = `${existingData}\n${csvData}`;
            if (!existingData) {
                parser = new Parser({ header: true });
                csvData = parser.parse(data);
                newData = csvData;
            }
            await writeToFile(key, newData, metadata);
        } else {
            console.log('The file does not exist inside of the ouput folder...');
            // Create a new file
            await writeToFile(key, csvData, metadata);
        }
    } catch (error) {
        console.log('Error when appending to the file:', error);
        throw new Error('Error occured when appending data to the output CSV :',error.message);
    }
}