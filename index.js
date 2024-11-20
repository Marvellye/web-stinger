const express = require("express");
const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const cors = require("cors");

// Add Stealth Plugin
puppeteer.use(StealthPlugin());

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for all requests
app.use(cors());

// Middleware to parse JSON input
app.use(express.json());

// Root route to verify the server is running
app.get("/", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Stinger is running with enhanced evasion!",
  });
});

// Route to fetch HTML
app.get("/render", async (req, res) => {
  const url = req.query.url;

  if (!url) {
    return res.status(400).json({ error: "Query parameter 'url' is required" });
  }

  try {
    // Launch Puppeteer browser with stealth plugin
    const browser = await puppeteer.launch({
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-blink-features=AutomationControlled",
      ],
      headless: true, // Set to false for debugging
    });

    const page = await browser.newPage();

    // Set User-Agent and headers
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36"
    );
    await page.setExtraHTTPHeaders({
      "Accept-Language": "en-US,en;q=0.9",
    });

    // Go to the provided URL
    await page.goto(url, {
      waitUntil: "networkidle2", // Wait for all network requests to finish
    });

    // Wait for the full page to load
    await page.waitForTimeout(3000); // Additional wait time to simulate human-like behavior

    // Get the full HTML of the page
    const html = await page.content();

    // Close the browser
    await browser.close();

    // Return the HTML
    res.status(200).json({ html });
  } catch (error) {
    console.error("Error fetching HTML:", error.message);
    res.status(500).json({ error: "Failed to fetch HTML" });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
