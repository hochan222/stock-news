const fs = require("fs");
const axios = require("axios");
const yahooFinance = require("yahoo-finance2").default;

async function fetchBitcoinPrice() {
  try {
    const response = await axios.get(
      "https://api.coindesk.com/v1/bpi/currentprice.json"
    );
    return response.data.bpi.USD.rate_float;
  } catch (error) {
    console.error("Error fetching Bitcoin price:", error);
    return null;
  }
}

async function fetchNasdaqPrice() {
  try {
    const quote = await yahooFinance.quote("^IXIC");
    return quote.regularMarketPrice;
  } catch (error) {
    console.error("Error fetching Nasdaq price:", error);
    return null;
  }
}

async function fetchKospiPrice() {
  try {
    const quote = await yahooFinance.quote("^KS11");
    return quote.regularMarketPrice;
  } catch (error) {
    console.error("Error fetching Kospi price:", error);
    return null;
  }
}

async function fetchUsdKrwRate() {
  try {
    const response = await axios.get(
      "https://api.exchangerate-api.com/v4/latest/USD"
    );
    return response.data.rates.KRW;
  } catch (error) {
    console.error("Error fetching USD to KRW rate:", error);
    return null;
  }
}

async function updateChartData() {
  let chartData = [];
  try {
    const fileData = fs.readFileSync("../public/chartData.json", "utf8");
    chartData = JSON.parse(fileData);
  } catch (error) {
    if (error.code !== "ENOENT") {
      console.error("Error reading ../public/chartData.json:", error);
      return;
    }
  }

  // 현재 날짜 가져오기
  const currentDate = new Date().toISOString().split("T")[0];

  // 비트코인, 나스닥, 코스피, 달러 환율 데이터 가져오기
  const bitcoinPrice = await fetchBitcoinPrice();
  const nasdaqPrice = await fetchNasdaqPrice();
  const kospiPrice = await fetchKospiPrice();
  const usdKrwRate = await fetchUsdKrwRate();

  if (
    bitcoinPrice === null ||
    nasdaqPrice === null ||
    kospiPrice === null ||
    usdKrwRate === null
  ) {
    console.error("Error fetching one or more prices, aborting update.");
    return;
  }

  // 새로운 데이터 추가 또는 기존 데이터 덮어쓰기
  const newData = {
    date: currentDate,
    nasdaq: nasdaqPrice,
    kospi: kospiPrice,
    bitcoin: bitcoinPrice,
    usd_krw: usdKrwRate,
  };

  const existingIndex = chartData.findIndex(
    (entry) => entry.date === currentDate
  );
  if (existingIndex !== -1) {
    chartData[existingIndex] = newData;
  } else {
    chartData.push(newData);
  }

  // JSON 파일 업데이트
  try {
    fs.writeFileSync(
      "../public/chartData.json",
      JSON.stringify(chartData, null, 2)
    );
  } catch (error) {
    console.error("Error writing to ../public/chartData.json:", error);
  }
}

updateChartData();
