# Facebook Public Data Scraper (MVP)

This project scrapes publicly available data from Facebook using Node.js and Puppeteer.

## Disclaimer

This tool is intended for educational purposes and as a proof-of-concept. Scraping Facebook is against their Terms of Service. Use this tool responsibly and at your own risk. The HTML structure of Facebook changes frequently, and the CSS selectors in this code will require regular maintenance to continue functioning correctly.

## Prerequisites

-   Node.js (v18 or newer recommended)
-   A valid Facebook account

## Setup

1.  **Clone the repository:**
    ```bash
    git clone <your-repo-url>
    cd facebook-scraper
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Configure your credentials:**
    -   Rename the `.env.example` file to `.env`.
    -   Open the `.env` file and enter your Facebook email and password.
    -   Optionally, you can add a `PROXY_SERVER` URL if you wish to use a proxy.

## How to Run

The scraper is run from the command line. The first time you run it, it will open a browser, log you in, and save your session cookies to a `cookies.json` file to speed up future runs.

### **Available Commands**

#### **Scenario 1: Scrape Public Profile Information**

```bash
npm start scrape-profile --url "[https://www.facebook.com/zuck](https://www.facebook.com/zuck)"
```

#### **Scenario 2: Scrape Profile Posts (Bulk)**

Scrapes the 20 most recent posts from a profile.

```bash
npm start scrape-posts --url "[https://www.facebook.com/zuck](https://www.facebook.com/zuck)" --count 20
```

#### **Scenario 4: Scrape Profiles from a Search Query**

Searches for "New York" and attempts to retrieve up to 100 profiles.

```bash
npm start scrape-search --query "New York" --count 100
```

### **Output**

The script will generate a JSON file in the root directory named after the command and the current timestamp (e.g., `scrape-profile-2025-06-27T10-00-00.000Z.json`). On error, it will save a screenshot for debugging purposes.