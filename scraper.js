import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { promises as fs } from 'fs';
import 'dotenv/config';

// Apply the stealth plugin
puppeteer.use(StealthPlugin());

const COOKIES_FILE = 'cookies.json';

/**
 * Initializes a Puppeteer browser instance, handles login, and returns a page object.
 * @returns {Promise<import('puppeteer').Page>} A ready-to-use page object.
 */
export async function launchBrowserAndLogin() {
    const launchOptions = {
        headless: true, // Set to false to see the browser in action
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-notifications',
        ],
    };

    if (process.env.PROXY_SERVER) {
        launchOptions.args.push(`--proxy-server=${process.env.PROXY_SERVER}`);
    }

    const browser = await puppeteer.launch(launchOptions);
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });

    try {
        // Load cookies if they exist
        const cookies = await fs.readFile(COOKIES_FILE, 'utf8');
        const deserializedCookies = JSON.parse(cookies);
        await page.setCookie(...deserializedCookies);
        console.log('Session cookies loaded successfully.');

        await page.goto('https://www.facebook.com', { waitUntil: 'networkidle2' });

        // Check if login is still valid by looking for a logout button or profile picture link
        const isLoggedIn = await page.$('a[href*="/logout.php"]');
        if (!isLoggedIn) {
            console.log('Session expired. Logging in again.');
            await performLogin(page);
        }

    } catch (error) {
        console.log('No session cookies found or an error occurred. Performing fresh login.');
        await performLogin(page);
    }

    return { page, browser };
}

/**
 * Performs the login action on Facebook.
 * @param {import('puppeteer').Page} page
 */
async function performLogin(page) {
    await page.goto('https://www.facebook.com/login', { waitUntil: 'networkidle2' });
    
    // Handle cookie consent dialog if it appears
    const cookieButton = await page.$('button[data-cookiebanner="accept_button"]');
    if (cookieButton) {
        await cookieButton.click();
        await page.waitForNavigation({ waitUntil: 'networkidle2' });
    }

    await page.type('#email', process.env.FACEBOOK_EMAIL);
    await page.type('#pass', process.env.FACEBOOK_PASSWORD);
    await page.click('#loginbutton');

    await page.waitForNavigation({ waitUntil: 'networkidle0' });

    // Verify login success
    const loginError = await page.$('#login_error');
    if (loginError) {
        throw new Error('Login failed. Please check your credentials in the .env file.');
    }

    console.log('Login successful.');

    // Save session cookies
    const cookies = await page.cookies();
    await fs.writeFile(COOKIES_FILE, JSON.stringify(cookies, null, 2));
    console.log('Session cookies saved.');
}

/**
 * A utility function to scroll a page to the bottom to trigger infinite scroll.
 * @param {import('puppeteer').Page} page
 */
export async function autoScroll(page) {
    await page.evaluate(async () => {
        await new Promise((resolve) => {
            let totalHeight = 0;
            const distance = 100;
            const timer = setInterval(() => {
                const scrollHeight = document.body.scrollHeight;
                window.scrollBy(0, distance);
                totalHeight += distance;

                if (totalHeight >= scrollHeight - window.innerHeight) {
                    clearInterval(timer);
                    resolve();
                }
            }, 100);
        });
    });
}