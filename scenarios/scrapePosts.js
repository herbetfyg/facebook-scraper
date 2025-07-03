import { autoScroll } from '../scraper.js';

// NOTE: This is a simplified structure. Scraping comments and reactions
// requires clicking on each post's comment/reaction link, handling pop-up modals,
// and scrolling within them. This would make the code exceptionally long.

/**
 * Scrapes a specified number of recent posts from a profile.
 * @param {import('puppeteer').Page} page
 * @param {string} profileUrl
 * @param {number} numPosts
 * @returns {Promise<Array<Object>>}
 */
export async function scrapePosts(page, profileUrl, numPosts) {
    console.log(`Scraping ${numPosts} posts from ${profileUrl}`);
    await page.goto(profileUrl, { waitUntil: 'networkidle2' });

    let posts = [];
    while (posts.length < numPosts) {
        await autoScroll(page);
        await page.waitForTimeout(2000); // Wait for content to load after scroll

        const newPosts = await page.evaluate((numPosts) => {
            // Selector for post containers. This is the most critical and fragile part.
            // It MUST be updated by inspecting a live Facebook page.
            const postSelector = 'div[data-ad-preview="message"]'; 
            const postElements = document.querySelectorAll(postSelector);
            const scrapedData = [];

            for (const post of postElements) {
                if (scrapedData.length >= numPosts) break;

                const postData = {};
                postData.content = post.innerText || null;
                
                // Timestamp is often in an <abbr> tag or a link with a specific URL structure
                postData.timestamp = post.closest('div[role="article"]')?.querySelector('a[href*="/posts/"] > span')?.innerText || null;
                
                // Find image links
                postData.imageUrls = Array.from(post.querySelectorAll('img[alt]')).map(img => img.src);

                // Placeholder for comments and reactions
                postData.comments = "Requires clicking 'comments' and scraping modal";
                postData.reactions = "Requires clicking 'reactions' and scraping modal";

                scrapedData.push(postData);
            }
            return scrapedData;
        }, numPosts);

        posts = newPosts; // In a real scenario, you'd merge and deduplicate

        if ((await page.evaluate(() => document.body.scrollHeight)) === (await page.evaluate(() => window.scrollY + window.innerHeight))) {
             console.log('Reached end of page.');
             break;
        }
    }
    
    console.log(`Successfully scraped ${posts.length} posts.`);
    return posts.slice(0, numPosts);
}