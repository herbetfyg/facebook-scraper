import { autoScroll } from '../scraper.js';

/**
 * Scrapes profile links from a search query.
 * @param {import('puppeteer').Page} page
 * @param {string} query
 * @param {number} numProfiles
 * @returns {Promise<Array<Object>>}
 */
export async function scrapeSearch(page, query, numProfiles) {
    const searchUrl = `https://www.facebook.com/search/people/?q=${encodeURIComponent(query)}`;
    console.log(`Scraping search results for: "${query}"`);
    await page.goto(searchUrl, { waitUntil: 'networkidle2' });

    let profiles = new Map(); // Use a Map to automatically handle duplicates

    while (profiles.size < numProfiles) {
        const initialProfileCount = profiles.size;
        await autoScroll(page);
        await page.waitForTimeout(3000); // Wait for results to load

        const newProfiles = await page.evaluate(() => {
            const results = [];
            // This selector targets links within the main search results area that point to profiles.
            // It filters out links to groups, pages, etc., by looking for a specific parent structure.
            // This selector is fragile and needs regular updating.
            const profileLinks = document.querySelectorAll('div[role="main"] a[href*="/user/"]');
            
            profileLinks.forEach(link => {
                const name = link.innerText.split('\n')[0];
                if (name && link.href) {
                     results.push({ name, profileUrl: link.href });
                }
            });
            return results;
        });

        newProfiles.forEach(p => profiles.set(p.profileUrl, p));
        
        if (profiles.size === initialProfileCount) {
            console.log("No new profiles found on scroll. Ending search.");
            break;
        }

        console.log(`Found ${profiles.size} unique profiles so far...`);
    }

    console.log(`Finished scraping. Total unique profiles found: ${profiles.size}`);
    return Array.from(profiles.values()).slice(0, numProfiles);
}