const puppeteer = require('puppeteer');
(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    page.on('pageerror', error => {
        console.log('CRASH CAUGHT:', error.message);
        console.log('STACK:', error.stack);
    });
    await page.goto('http://localhost:3000');
    await new Promise(r => setTimeout(r, 2000));
    await browser.close();
})();
