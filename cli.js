#!/usr/bin/env node

const { program } = require('commander');
const os = require('os');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const { JoinGoogleMeet } = require('./joinGoogleMeet');
const { SpeechToText } = require('./speechToText');

async function main() {
    program
        .option('--meet-link <link>', 'Google Meet link', process.env.MEET_LINK)
        .option('--duration <seconds>', 'Recording duration in seconds', 
            parseInt(process.env.RECORDING_DURATION || '60'))
        .option('--no-analysis', 'Skip analysis phase')
        .parse(process.argv);

    const options = program.opts();

    if (!options.meetLink) {
        console.error('--meet-link (or MEET_LINK env) is required');
        process.exit(1);
    }

    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'meet-'));
    const audioPath = path.join(tempDir, 'output.wav');

    const bot = new JoinGoogleMeet();
    await bot.gLogin();
    await bot.turnOffMicCam(options.meetLink);
    await bot.askToJoin(audioPath, options.duration);

    if (options.analysis !== false) {
        const stt = new SpeechToText();
        await stt.transcribe(audioPath);
    }
}

main().catch(console.error);