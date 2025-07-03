import { launchBrowserAndLogin } from './scraper.js';
import { scrapeProfile } from './scenarios/scrapeProfile.js';
import { scrapePosts } from './scenarios/scrapePosts.js';
// import { scrapeSinglePost } from './scenarios/scrapeSinglePost.js';
import { scrapeSearch } from './scenarios/scrapeSearch.js';
import { promises as fs } from 'fs';

async function main() {
    const args = process.argv.slice(2);
    const command = args[0];
    
    if (!command) {
        console.error('Error: No command specified.');
        console.log('Usage: npm start <command> [--url <url>] [--query <query>] [--count <number>]');
        console.log('Commands: scrape-profile, scrape-posts, scrape-search');
        return;
    }

    const url = args.includes('--url') ? args[args.indexOf('--url') + 1] : null;
    const query = args.includes('--query') ? args[args.indexOf('--query') + 1] : null;
    const count = args.includes('--count') ? parseInt(args[args.indexOf('--count') + 1], 10) : 50;

    const { page, browser } = await launchBrowserAndLogin();
    let data;

    try {
        switch (command) {
            case 'scrape-profile':
                if (!url) throw new Error('"--url" is required for scrape-profile');
                data = await scrapeProfile(page, url);
                break;
            case 'scrape-posts':
                 if (!url) throw new Error('"--url" is required for scrape-posts');
                 data = await scrapePosts(page, url, count);
                 break;
            case 'scrape-search':
                if (!query) throw new Error('"--query" is required for scrape-search');
                data = await scrapeSearch(page, query, count);
                break;
            // case 'scrape-single-post':
            //     if (!url) throw new Error('"--url" is required for scrape-single-post');
            //     data = await scrapeSinglePost(page, url);
            //     break;
            default:
                console.error(`Unknown command: ${command}`);
                break;
        }

        if (data) {
            const fileName = `${command}-${new Date().toISOString().replace(/:/g, '-')}.json`;
            await fs.writeFile(fileName, JSON.stringify(data, null, 2));
            console.log(`\n✅ Success! Data saved to ${fileName}`);
        }

    } catch (error) {
        console.error('\n❌ An error occurred during scraping:', error.message);
        // Take a screenshot on error for debugging
        const errorScreenshot = `error-${new Date().toISOString().replace(/:/g, '-')}.png`;
        await page.screenshot({ path: errorScreenshot, fullPage: true });
        console.log(`A screenshot has been saved to ${errorScreenshot}`);
    } finally {
        await browser.close();
        console.log('Browser closed.');
    }
}

main();