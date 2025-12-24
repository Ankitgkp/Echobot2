const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const AudioRecorder = require('./record_audio');

dotenv.config();

class JoinGoogleMeet {
    constructor() {
        this.mailAddress = process.env.EMAIL_ID;
        this.password = process.env.EMAIL_PASSWORD;

        const userDataDir = path.join(require('os').homedir(), '.google_meet_bot_profile');
        if (!fs.existsSync(userDataDir)) {
            fs.mkdirSync(userDataDir);
        }

        const options = new chrome.Options();
        options.addArguments(`--user-data-dir=${userDataDir}`);
        options.addArguments('--profile-directory=Default');
        options.addArguments('--disable-blink-features=AutomationControlled');
        options.addArguments('--start-maximized');
        options.setUserPreferences({
            'profile.default_content_setting_values.media_stream_mic': 1,
            'profile.default_content_setting_values.media_stream_camera': 1,
            'profile.default_content_setting_values.geolocation': 0,
            'profile.default_content_setting_values.notifications': 1
        });

        this.driver = new Builder().forBrowser('chrome').setChromeOptions(options).build();
    }

    async login() {
        await this.driver.get('https://google.com/');
        try {
            await this.driver.findElement(By.css('a[aria-label*="Google Account"]'));
            console.log("Already logged in to Google.");
            return;
        } catch {
            console.log("Not logged in. Proceeding with login.");
        }

        await this.driver.get('https://accounts.google.com/ServiceLogin');
        await this.driver.findElement(By.id('identifierId')).sendKeys(this.mailAddress);
        await this.driver.findElement(By.id('identifierNext')).click();
        await this.driver.sleep(2000);
        await this.driver.findElement(By.xpath('//*[@id="password"]/div[1]/div/div[1]/input')).sendKeys(this.password);
        await this.driver.findElement(By.id('passwordNext')).click();
        console.log("Gmail login activity: Done");
    }

    async turnOffMicCam(meetLink) {
        await this.driver.get(meetLink);
        await this.driver.sleep(5000);

        try {
            const micButton = await this.driver.wait(until.elementLocated(By.css('[aria-label*="microphone" i]')), 10000);
            await micButton.click();
            console.log("Turn off mic activity: Done");
        } catch {
            console.log("Could not find mic button, it may already be off.");
        }

        try {
            const camButton = await this.driver.wait(until.elementLocated(By.css('[aria-label*="camera" i]')), 10000);
            await camButton.click();
            console.log("Turn off camera activity: Done");
        } catch {
            console.log("Could not find camera button, it may already be off.");
        }
    }

    async askToJoin(audioPath, duration) {
        await this.driver.sleep(3000);
        try {
            const joinButton = await this.driver.wait(until.elementLocated(By.xpath('//button[.//span[contains(text(), "Join now")]]')), 5000);
            await joinButton.click();
            console.log("Join now activity: Done");
        } catch {
            console.log("Join now button not found.");
        }

        const recorder = new AudioRecorder();
        await recorder.getAudio(audioPath, duration);
    }
}

module.exports = JoinGoogleMeet;
