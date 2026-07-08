const fs = require('fs');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const html = fs.readFileSync('index.html', 'utf8');

const virtualConsole = new jsdom.VirtualConsole();
virtualConsole.on("error", () => {
    console.error("JSDOM Error:", ...arguments);
});
virtualConsole.on("warn", () => {
    console.warn("JSDOM Warn:", ...arguments);
});
virtualConsole.on("info", () => {
    console.info("JSDOM Info:", ...arguments);
});
virtualConsole.on("dir", () => {
    console.dir("JSDOM Dir:", ...arguments);
});
virtualConsole.on("log", (msg) => {
    if (msg.includes('JSDOM')) return; // Ignore JSDOM internals
    console.log("JSDOM Log:", msg);
});

// Capture unhandled rejections
process.on('unhandledRejection', (reason, p) => {
  console.error('Unhandled Rejection at:', p, 'reason:', reason);
});

const dom = new JSDOM(html, {
  runScripts: "dangerously",
  resources: "usable",
  url: "http://localhost:3000"
});

dom.window.addEventListener('error', (event) => {
    console.error('Window Error:', event.error);
});

setTimeout(() => {
    console.log("Finished running JSDOM for 3 seconds.");
}, 3000);
