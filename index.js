const express = require("express");
const puppeteer = require("puppeteer");
const cors = require("cors");

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
    message: "Puppeteer HTML Fetcher is running!",
  });
});

// Route to fetch HTML using GET request
app.get("/render", async (req, res) => {
  const url = req.query.url;

  if (!url) {
    return res.status(400).json({ error: "Query parameter 'url' is required" });
  }

  try {
    // Launch Puppeteer browser
    const browser = await puppeteer.launch({
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();

    // Navigate to the provided URL
    await page.goto(url, { waitUntil: "networkidle2" });

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
