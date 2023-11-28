import fs from 'fs';
import fetch from 'node-fetch';
import FormData from 'form-data';
import { Readable } from 'stream';

async function sendToWhisperServer(recordingUrl) {
    try {
        const response = await fetch(recordingUrl);
        logToFile('Received recording from Twilio: ' + recordingUrl);
        const buffer = await response.buffer(); // Get the buffer

        // Save the buffer as an MP3 file
        const filename = 'recording.mp3';
        fs.writeFileSync(filename, buffer);
        logToFile('Recording saved as ' + filename);

        // Convert the buffer into a stream
        const stream = new Readable();
        stream.push(buffer);
        stream.push(null); // Indicate the end of the stream

        const formData = new FormData();
        formData.append('file', stream, {
            filename: filename,
            contentType: 'audio/mpeg'
        });
        formData.append('temperature', '0.2');
        formData.append('response-format', 'json');

        const inferenceResponse = await fetch('http://127.0.0.1:8080/inference', {
            method: 'POST',
            body: formData,
            headers: formData.getHeaders() // Include the headers generated by form-data
        });

        if (inferenceResponse.ok) {
            const inferenceData = await inferenceResponse.json();
            logToFile('Received response from inference server.');
            return inferenceData;
        } else {
            throw new Error('Inference server responded with an error.');
        }
    } catch (error) {
        console.error('Error sending to inference server:', error);
        logToFile(`Error: ${error.message}`);
        throw error;
    }
}

function logToFile(message) {
    // Implement the logging function here
    console.log(message);
}

export default sendToWhisperServer;