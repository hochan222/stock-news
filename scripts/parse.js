const axios = require("axios");
const { JSDOM } = require("jsdom");
const fs = require("fs");
const path = require("path");

async function parseNews() {
  const inputData = JSON.parse(fs.readFileSync("input.json", "utf-8"));
  const importantUrls = inputData.important_urls || [];
  const generalUrls = inputData.general_urls || [];

  if (
    (!Array.isArray(importantUrls) || importantUrls.length === 0) &&
    (!Array.isArray(generalUrls) || generalUrls.length === 0)
  ) {
    throw new Error("URL array parameter is required");
  }

  // Helper function to get the start of the week (Monday) for a given date
  const getStartOfWeek = (date) => {
    const currentDate = new Date(date);
    const day = currentDate.getDay();
    const diff = currentDate.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is Sunday
    const monday = new Date(currentDate.setDate(diff));
    return monday.toISOString().split("T")[0];
  };

  const results = {};
  // 현재 날짜 가져오기
  const currentDate = new Date();
  currentDate.setDate(currentDate.getDate());

  // 한국 시간(UTC+9)으로 변환
  const koreaOffset = 9 * 60 * 60000; // 9시간을 밀리초로 변환
  const koreaTime = new Date(currentDate.getTime() + koreaOffset);

  // 한국 날짜를 YYYY-MM-DD 형식으로 출력
  const nextDate = koreaTime.toISOString().split("T")[0];
  const weekStartDate = getStartOfWeek(nextDate);
  const year = new Date(weekStartDate).getFullYear();

  results[nextDate] = {
    important: [],
    general: [],
  };

  // Helper function to parse a list of URLs
  async function parseUrls(urls, category) {
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
          .querySelector('meta[property="og:article:author"]')
          ?.getAttribute("content");

        if (!title || !description) {
          throw new Error("Failed to extract title or description");
        }

        results[nextDate][category].push({
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
  }

  // Parse important URLs
  await parseUrls(importantUrls, "important");
  // Parse general URLs
  await parseUrls(generalUrls, "general");

  // Define the path for the output JSON file
  const outputDir = path.join(__dirname, `../public/news/${year}`);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  const outputPath = path.join(outputDir, `${weekStartDate}.json`);

  // Check if the output file already exists
  let existingData = {};
  if (fs.existsSync(outputPath)) {
    existingData = JSON.parse(fs.readFileSync(outputPath, "utf-8"));
  }

  // Merge existing data with new results, avoiding duplicate titles
  for (const [key, value] of Object.entries(results)) {
    if (existingData[key]) {
      existingData[key].important = existingData[key].important.concat(
        value.important.filter(
          (newItem) =>
            !existingData[key].important.some(
              (existingItem) => existingItem.title === newItem.title
            )
        )
      );
      existingData[key].general = existingData[key].general.concat(
        value.general.filter(
          (newItem) =>
            !existingData[key].general.some(
              (existingItem) => existingItem.title === newItem.title
            )
        )
      );
    } else {
      existingData[key] = value;
    }
  }

  // Write the merged data to the output file
  fs.writeFileSync(outputPath, JSON.stringify(existingData, null, 2));
  console.log(`Data saved to ${outputPath}`);
}

// Example usage:
parseNews();
