const fs = require('fs');
const { execSync } = require('child_process');
const dotenv = require('dotenv');

dotenv.config();

class AudioRecorder {
    constructor() {
        this.sampleRate = parseInt(process.env.SAMPLE_RATE) || 44100;
        this.channels = 2; // Default to stereo
    }

    async getAudio(filename, duration) {
        console.log(`Recording with ${this.channels} channel(s)...`);
        try {
            execSync(`ffmpeg -f avfoundation -i ":0" -t ${duration} -ar ${this.sampleRate} -ac ${this.channels} ${filename}`);
            console.log(`Recording finished. Saved as ${filename}.`);
        } catch (error) {
            console.error(`Error recording audio: ${error.message}`);
            console.log("Retrying with 1 channel...");
            try {
                execSync(`ffmpeg -f avfoundation -i ":0" -t ${duration} -ar ${this.sampleRate} -ac 1 ${filename}`);
                console.log(`Recording finished. Saved as ${filename}.`);
            } catch (error2) {
                console.error(`Failed to record audio: ${error2.message}`);
            }
        }
    }
}

module.exports = AudioRecorder;
