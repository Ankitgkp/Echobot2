const recorder = require('node-record-lpcm16');
const fs = require('fs');
const wav = require('wav');
require('dotenv').config();

class AudioRecorder {
    constructor() {
        this.sampleRate = parseInt(process.env.SAMPLE_RATE || '44100');
        this.channels = 1; // Default to mono for compatibility
    }

    async getAudio(filename, duration) {
        return new Promise((resolve, reject) => {
            console.log(`Recording with ${this.channels} channel(s)...`);
            
            const fileWriter = new wav.FileWriter(filename, {
                channels: this.channels,
                sampleRate: this.sampleRate,
                bitDepth: 16
            });

            const recording = recorder.record({
                sampleRate: this.sampleRate,
                channels: this.channels,
                audioType: 'wav',
                silence: '0',
                threshold: 0,
                thresholdStart: null,
                thresholdEnd: null,
                recorder: 'sox' // Can also use 'rec' or 'arecord' on Linux
            });

            recording.stream()
                .pipe(fileWriter)
                .on('finish', () => {
                    console.log(`Recording finished. Saved as ${filename}.`);
                    resolve();
                })
                .on('error', (err) => {
                    console.error(`Error recording audio: ${err.message}`);
                    reject(err);
                });

            // Stop recording after duration
            setTimeout(() => {
                recording.stop();
            }, duration * 1000);
        });
    }
}

module.exports = { AudioRecorder };