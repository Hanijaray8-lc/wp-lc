const express = require('express');
const puppeteer = require('puppeteer');
const Place = require('../models/GoogleMap');
const router = express.Router();

router.get('/scrape-maps', async (req, res) => {
  const { query, companyName } = req.query;
  if (!query) return res.status(400).json({ error: 'Missing query' });

  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64)...');
    await page.goto(`https://www.google.com/maps/search/${encodeURIComponent(query)}`, {
      waitUntil: 'networkidle2',
      timeout: 60000
    });

    await page.waitForSelector('.hfpxzc', { timeout: 30000 });

    // Scroll to load more results
    let previousHeight;
    while (true) {
      previousHeight = await page.evaluate(() => {
        const el = document.querySelector('.m6QErb.DxyBCb.kA9KIf.dS8AEf.ecceSd');
        return el ? el.scrollHeight : 0;
      });
      await page.evaluate(() => {
        const el = document.querySelector('.m6QErb.DxyBCb.kA9KIf.dS8AEf.ecceSd');
        if (el) el.scrollBy(0, el.scrollHeight);
      });
      await new Promise(resolve => setTimeout(resolve, 3000));
      const newHeight = await page.evaluate(() => {
        const el = document.querySelector('.m6QErb.DxyBCb.kA9KIf.dS8AEf.ecceSd');
        return el ? el.scrollHeight : 0;
      });
      if (newHeight === previousHeight && newHeight > 0) break;
      const count = await page.$$eval('.hfpxzc', cards => cards.length);
      if (count > 200) break;
    }

    res.writeHead(200, {
      'Content-Type': 'application/json',
      'Transfer-Encoding': 'chunked',
      'Connection': 'keep-alive'
    });

    let cardElements = await page.$$('.hfpxzc');
    for (let i = 0; i < cardElements.length; i++) {
      try {
        const card = cardElements[i];
        if (!card) continue;
        await card.click();

        await page.waitForSelector('h1.DUwDvf', { timeout: 15000 });
        await new Promise(res => setTimeout(res, 1000));

        const data = await page.evaluate(() => {
          const name = document.querySelector('h1.DUwDvf')?.textContent?.trim() || 'No Name';
          const address = document.querySelector('button[data-item-id="address"]')?.textContent?.trim() || 'N/A';
          const website = document.querySelector('a[data-item-id="authority"]')?.href?.trim() || 'N/A';
          const mapLink = document.querySelector('meta[itemprop="url"]')?.content?.trim() || window.location.href;

          let phone = 'N/A';
          const phoneBtn = document.querySelector('button[data-item-id^="phone"]');
          if (phoneBtn) {
            phone = phoneBtn.textContent?.trim() || 'N/A';
          }

          return { name, address, phone, website, mapLink };
        });

        // ✅ Attach metadata
        data.companyName = companyName || 'Unknown';
        data.originalQuery = query;

        try {
          await Place.create(data);
        } catch (err) {
          if (err.code === 11000) {
            console.log('Duplicate:', data.mapLink);
          } else {
            console.error('Mongo Error:', err.message);
          }
        }

        res.write(JSON.stringify(data) + '\n');

        await page.goBack({ waitUntil: 'networkidle2' });
        await page.waitForSelector('.hfpxzc', { timeout: 30000 });
        cardElements = await page.$$('.hfpxzc');

      } catch (err) {
        console.warn('Skipping item:', err.message);
        try {
          await page.goBack({ waitUntil: 'networkidle2' });
          await page.waitForSelector('.hfpxzc', { timeout: 30000 });
          cardElements = await page.$$('.hfpxzc');
        } catch (backErr) {
          break;
        }
      }
    }

    res.end();
  } catch (err) {
    console.error('Scraping Error:', err.message);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Scraping failed', details: err.message });
    } else {
      res.end();
    }
  } finally {
    if (browser) await browser.close();
  }
});

module.exports = router;
