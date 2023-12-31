import dotenv from 'dotenv';
import express from 'express';
import VoiceResponse from 'twilio/lib/twiml/VoiceResponse.js';
import logToFile from '../logger/log_to_file.js';

dotenv.config();

const router = express.Router();

router.post('/incoming_call', (req, res) => {
    logToFile('Received an incoming call from: ' + req.body.From);

    const twiml = new VoiceResponse();
    twiml.play({
            loop: 1
        },
        "https://www.soundjay.com/buttons/beep-07a.wav"
    );

    const websocketServer = process.env.WEBSOCKET_ADDRESS;
    const apiKey = process.env.API_KEY;
    const websocketUrlWithApiKey = `${websocketServer}?API-KEY=${apiKey}`;
    console.log("type of websocket: " + typeof websocketServer);
    try {
        console.log('Starting stream');
        logToFile('Starting stream');

        console.log("websocket address: " + websocketServer);
        const connect = twiml.connect();
        connect.stream({
            url: websocketUrlWithApiKey,
        });
        twiml.pause({length: 20});

        res.type('text/xml');
        res.send(twiml.toString());
    } catch (error) {
        console.error('Error starting stream:', error);
        logToFile('Error starting stream: ' + error);
        res.type('text/xml');
        res.status(500).send('Error starting stream');
    }
});

export default router;