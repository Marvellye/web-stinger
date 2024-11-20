const express = require("express");
const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const cors = require("cors");

// Add Puppeteer Stealth Plugin
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
    message: "Puppeteer Title Fetcher is running!",
  });
});

// Route to fetch page title
app.get("/fetch-title", async (req, res) => {
  const url = req.query.url;

  if (!url) {
    return res.status(400).json({ error: "Query parameter 'url' is required" });
  }

  try {
    // Launch Puppeteer browser with stealth plugin
    const browser = await puppeteer.launch({
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
      headless: true,
    });

    const page = await browser.newPage();

    // Set User-Agent and headers
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36"
    );
    await page.setExtraHTTPHeaders({
      "Accept-Language": "en-US,en;q=0.9",
    });

    // Navigate to the provided URL
    await page.goto(url, { waitUntil: "networkidle2" });

    // Extract the page title
    const title = await page.title();

    // Close the browser
    await browser.close();

    // Return the title
    res.status(200).json({ title });
  } catch (error) {
    console.error("Error fetching title:", error.message);
    res.status(500).json({ error: "Failed to fetch title" });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
