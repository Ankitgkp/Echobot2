const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const path = require('path');
const os = require('os');
const fs = require('fs');
require('dotenv').config();

const { AudioRecorder } = require('./recordAudio');

class JoinGoogleMeet {
    constructor() {
        this.mailAddress = process.env.EMAIL_ID;
        this.password = process.env.EMAIL_PASSWORD;
        this.driver = null;
    }

    async initialize() {
        const userDataDir = path.join(os.homedir(), '.google_meet_bot_profile');
        if (!fs.existsSync(userDataDir)) {
            fs.mkdirSync(userDataDir, { recursive: true });
        }

        const options = new chrome.Options();
        options.addArguments(`--user-data-dir=${userDataDir}`);
        options.addArguments('--profile-directory=Default');
        options.addArguments('--disable-blink-features=AutomationControlled');
        options.addArguments('--start-maximized');
        options.addArguments('--use-fake-ui-for-media-stream');
        options.addArguments('--use-fake-device-for-media-stream');
        
        options.setUserPreferences({
            'profile.default_content_setting_values.media_stream_mic': 1,
            'profile.default_content_setting_values.media_stream_camera': 1,
            'profile.default_content_setting_values.geolocation': 0,
            'profile.default_content_setting_values.notifications': 1
        });

        this.driver = await new Builder()
            .forBrowser('chrome')
            .setChromeOptions(options)
            .build();
    }

    async gLogin() {
        if (!this.driver) {
            await this.initialize();
        }

        await this.driver.get('https://google.com/');
        await this.sleep(2000);

        try {
            await this.driver.findElement(By.css('a[aria-label*="Google Account"]'));
            console.log('Already logged in to Google.');
            return;
        } catch (error) {
            console.log('Not logged in. Proceeding with login.');
        }

        await this.driver.get('https://accounts.google.com/ServiceLogin?hl=en&passive=true&continue=https://www.google.com/&ec=GAZAAQ');

        await this.driver.findElement(By.id('identifierId')).sendKeys(this.mailAddress);
        await this.driver.findElement(By.id('identifierNext')).click();
        await this.driver.manage().setTimeouts({ implicit: 10000 });

        await this.driver.wait(until.elementLocated(By.xpath('//*[@id="password"]/div[1]/div/div[1]/input')), 10000);
        await this.driver.findElement(By.xpath('//*[@id="password"]/div[1]/div/div[1]/input')).sendKeys(this.password);
        await this.driver.findElement(By.id('passwordNext')).click();
        await this.driver.manage().setTimeouts({ implicit: 10000 });

        await this.driver.get('https://google.com/');
        await this.sleep(3000);
        console.log('Gmail login activity: Done');
    }

    async turnOffMicCam(meetLink) {
        await this.driver.get(meetLink);
        await this.sleep(5000);

        try {
            const micButton = await this.driver.wait(
                until.elementLocated(By.css('[aria-label*="microphone" i], [data-tooltip*="microphone" i], div[jscontroller][data-anchor-id="hw0c9"]')),
                10000
            );
            await micButton.click();
            console.log('Turn off mic activity: Done');
        } catch (error) {
            console.log('Could not find mic button, it may already be off or the page layout has changed.');
        }

        await this.sleep(1000);

        try {
            const camButton = await this.driver.wait(
                until.elementLocated(By.css('[aria-label*="camera" i], [data-tooltip*="camera" i], div[jscontroller][data-anchor-id="psRWwc"]')),
                10000
            );
            await camButton.click();
            console.log('Turn off camera activity: Done');
        } catch (error) {
            console.log('Could not find camera button, it may already be off or the page layout has changed.');
        }
    }

    async enterName(name) {
        try {
            const nameInput = await this.driver.wait(
                until.elementLocated(By.css('input[aria-label="Your name"]')),
                5000
            );
            await nameInput.clear();
            await nameInput.sendKeys(name);
            console.log('Name entered successfully.');
        } catch (error) {
            console.log('Name input field not found (expected if logged in).');
        }
    }

    async askToJoin(audioPath, duration) {
        await this.sleep(3000);
        await this.enterName('Google Meet Bot');
        await this.sleep(2000);

        let joinClicked = false;

        try {
            const joinNowButton = await this.driver.wait(
                until.elementLocated(By.xpath('//button[.//span[contains(text(), "Join now")]]')),
                5000
            );
            await joinNowButton.click();
            console.log('Join now activity: Done');
            joinClicked = true;
        } catch (error) {
            console.log('Join now button not found, trying Ask to join...');
        }

        if (!joinClicked) {
            try {
                const askToJoinButton = await this.driver.wait(
                    until.elementLocated(By.xpath('//button[.//span[contains(text(), "Ask to join")]]')),
                    5000
                );
                await askToJoinButton.click();
                console.log('Ask to join activity: Done');
                joinClicked = true;
            } catch (error) {
                console.log('Ask to join button not found, trying CSS selectors...');
            }
        }

        if (!joinClicked) {
            try {
                const joinButton = await this.driver.wait(
                    until.elementLocated(By.css('button[jsname="Qx7uuf"], button[data-idom-class*="join"], button[aria-label*="Join" i], button[aria-label*="Ask to join" i]')),
                    5000
                );
                await joinButton.click();
                console.log('Join activity: Done (CSS selector)');
                joinClicked = true;
            } catch (error) {
                // Continue to fallback
            }
        }

        if (!joinClicked) {
            try {
                const buttons = await this.driver.findElements(By.tagName('button'));
                for (const button of buttons) {
                    try {
                        const buttonText = (await button.getText()).toLowerCase();
                        if (buttonText.includes('join now') || buttonText.includes('ask to join') || buttonText === 'join') {
                            await button.click();
                            console.log('Join activity: Done (text fallback)');
                            joinClicked = true;
                            break;
                        }
                    } catch (error) {
                        continue;
                    }
                }
            } catch (error) {
                console.log(`Could not find join button: ${error.message}`);
            }
        }

        if (!joinClicked) {
            console.log('Failed to click any join button!');
        }

        const recorder = new AudioRecorder();
        await recorder.getAudio(audioPath, duration);
        
        await this.driver.quit();
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

module.exports = { JoinGoogleMeet };