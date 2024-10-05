// index.js
const axios = require("axios");
const { JSDOM } = require("jsdom");
const fs = require("fs");
const path = require("path");

async function parseNaverNews() {
  // Read URLs from input.json
  const inputData = JSON.parse(fs.readFileSync("input.json", "utf-8"));
  const urls = inputData.urls;

  if (!Array.isArray(urls) || urls.length === 0) {
    throw new Error("URL array parameter is required");
  }

  const results = {};
  const date = new Date().toISOString().split("T")[0];
  results[date] = [];

  for (const url of urls) {
    try {
      const response = await axios.get(url);
      if (response.status !== 200) {
        throw new Error("Failed to fetch the webpage");
      }

      const dom = new JSDOM(response.data);
      const document = dom.window.document;

      const title = document
        .querySelector('meta[property="og:title"]')
        ?.getAttribute("content");
      const description = document
        .querySelector('meta[property="og:description"]')
        ?.getAttribute("content");
      const image = document
        .querySelector('meta[property="og:image"]')
        ?.getAttribute("content");
      const author = document
        .querySelector('meta[property="article:author"]')
        ?.getAttribute("content");

      if (!title || !description) {
        throw new Error("Failed to extract title or description");
      }

      results[date].push({
        title: title,
        description: description,
        url: url,
        image: image || null,
        author: author || null,
      });
    } catch (error) {
      console.error("Error parsing URL:", url, "-", error.message);
    }
  }

  // Define the path for the output JSON file
  const outputPath = path.join(__dirname, "../public/newsData.json");

  // Check if the output file already exists
  let existingData = {};
  if (fs.existsSync(outputPath)) {
    existingData = JSON.parse(fs.readFileSync(outputPath, "utf-8"));
  }

  // Merge existing data with new results
  for (const [key, value] of Object.entries(results)) {
    if (existingData[key]) {
      existingData[key] = existingData[key].concat(value);
    } else {
      existingData[key] = value;
    }
  }

  // Write the merged data to newsData.json
  fs.writeFileSync(outputPath, JSON.stringify(existingData, null, 2));
  console.log("Data saved to ../public/newsData.json");
}

// Example usage:
parseNaverNews();
