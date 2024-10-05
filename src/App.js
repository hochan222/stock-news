import React, { useEffect, useState } from "react";
import styled from "styled-components";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  background: linear-gradient(to right, #6a11cb, #2575fc);
  border-radius: 15px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  @media (max-width: 768px) {
    padding: 10px;
  }
`;

const Header = styled.header`
  font-size: 2.5rem;
  text-align: center;
  color: #fff;
  margin-bottom: 30px;
  font-weight: bold;
`;

const DateShareContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 20px;
`;

const DateInput = styled.input`
  padding: 10px;
  font-size: 1.2rem;
  border-radius: 5px;
  border: 1px solid #ccc;
  margin-right: 10px;
`;

const ShareButton = styled.button`
  display: flex;
  align-items: center;
  padding: 10px 20px;
  font-size: 0.8rem;
  background: #ff5e57;
  color: #fff;
  border: none;
  border-radius: 50px;
  cursor: pointer;
  transition: background 0.3s, transform 0.3s;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  &:hover {
    background: #e04e4a;
    transform: translateY(-3px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
  }
  svg {
    margin-right: 8px;
  }
`;

const ChartContainer = styled.div`
  margin-bottom: 40px;
`;

const NewsCount = styled.p`
  text-align: center;
  color: #ffffff;
  margin-bottom: 20px;
`;

const NewsCard = styled.div`
  background: #ffffff;
  border: 1px solid #e0e0e0;
  padding: 10px;
  margin-bottom: 15px;
  border-radius: 12px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s, box-shadow 0.3s;
  display: flex;
  align-items: center;
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.2);
  }
  @media (max-width: 768px) {
    padding: 10px;
    flex-direction: column;
  }
`;

const NewsImage = styled.img`
  width: 120px;
  height: auto;
  border-radius: 8px;
  margin-right: 15px;
  flex-shrink: 0;
  @media (max-width: 768px) {
    width: 100%;
    margin-right: 0;
    margin-bottom: 10px;
  }
`;

const NewsDetails = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const NewsTitle = styled.h2`
  font-size: 1.3rem;
  color: #333;
  margin-bottom: 8px;
  font-weight: bold;
  @media (max-width: 768px) {
    font-size: 1.2rem;
  }
`;

const NewsContent = styled.p`
  font-size: 1rem;
  color: #555;
  margin-bottom: 10px;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  @media (max-width: 768px) {
    font-size: 0.9rem;
  }
`;

const NewsFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
`;

const NewsAuthor = styled.p`
  font-size: 0.9rem;
  color: #777;
  font-style: italic;
  margin-left: auto;
`;

const NewsLink = styled.a`
  font-size: 1rem;
  color: #2575fc;
  text-decoration: none;
  font-weight: bold;
  &:hover {
    text-decoration: underline;
  }
`;

const CategoryHeader = styled.h3`
  font-size: 2rem;
  color: #fff;
  margin-top: 40px;
  text-align: center;
`;

const Footer = styled.footer`
  color: #fff;
  padding: 20px;
  text-align: center;
  font-size: 1rem;
  border-radius: 0 0 15px 15px;
  margin-top: 40px;
  box-shadow: 0 -4px 8px rgba(0, 0, 0, 0.1);
  a {
    color: #ff7300;
    text-decoration: none;
    font-weight: bold;
    &:hover {
      text-decoration: underline;
    }
  }
`;

function App() {
  const [news, setNews] = useState({ important: [], general: [] });
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [chartData, setChartData] = useState([]);
  const [lineVisibility, setLineVisibility] = useState({
    nasdaq: true,
    kospi: true,
    bitcoin: true,
    usd_krw: true,
  });
  const PUBLIC_URL = "/stock-news/build";

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const sharedDate = urlParams.get("date");
    if (sharedDate) {
      setDate(sharedDate);
    }
  }, []);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await fetch(`${PUBLIC_URL}/newsData.json`);
        const data = await response.json();
        if (data[date]) {
          setNews(data[date]);
        } else {
          setNews({ important: [], general: [] });
        }
      } catch (error) {
        console.error("Error fetching news", error);
      }
    };
    fetchNews();
  }, [date]);

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        const response = await fetch(`${PUBLIC_URL}/chartData.json`);
        const data = await response.json();
        setChartData(data);
      } catch (error) {
        console.error("Error fetching chart data", error);
      }
    };
    fetchChartData();
  }, []);

  const handleDateSelect = (data) => {
    if (data && data.activeLabel) {
      setDate(data.activeLabel);
    }
  };

  const handleShare = () => {
    const shareText = `주식 뉴스 및 시세 웹앱에서 ${date}의 뉴스를 확인하세요!`;
    const url = new URL(window.location.href);
    const params = new URLSearchParams(url.search);
    params.set("date", date);

    const shareUrl = `${url.origin}${url.pathname}?${params.toString()}`;

    if (navigator.share) {
      navigator.share({
        title: "주식 뉴스 및 시세 웹앱",
        text: shareText,
        url: shareUrl,
      });
    } else {
      alert("공유하기가 지원되지 않는 브라우저입니다.");
    }
  };

  const toggleLine = (e) => {
    const { dataKey } = e;
    setLineVisibility((prev) => ({
      ...prev,
      [dataKey]: !prev[dataKey],
    }));
  };

  return (
    <Container>
      <Header>주식 뉴스 및 시세 웹앱</Header>
      <DateShareContainer>
        <DateInput
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        <ShareButton onClick={handleShare}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="2"
            stroke="currentColor"
            width="16"
            height="16"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 12v7a2 2 0 002 2h12a2 2 0 002-2v-7M16 6l-4-4m0 0L8 6m4-4v16"
            />
          </svg>
          공유하기
        </ShareButton>
      </DateShareContainer>
      <ChartContainer>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            onClick={handleDateSelect}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" stroke="#ffffff" />
            <YAxis stroke="#ffffff" />
            <Tooltip />
            <Legend onClick={toggleLine} />
            <Line
              type="monotone"
              dataKey="nasdaq"
              stroke="#8884d8"
              name="나스닥"
              hide={!lineVisibility.nasdaq}
            />
            <Line
              type="monotone"
              dataKey="kospi"
              stroke="#82ca9d"
              name="코스피"
              hide={!lineVisibility.kospi}
            />
            <Line
              type="monotone"
              dataKey="bitcoin"
              stroke="#ffc658"
              name="비트코인"
              hide={!lineVisibility.bitcoin}
            />
            <Line
              type="monotone"
              dataKey="usd_krw"
              stroke="#ff7300"
              name="환율"
              hide={!lineVisibility.usd_krw}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartContainer>

      <CategoryHeader>중요 뉴스</CategoryHeader>
      {news.important.length > 0 ? (
        news.important.map((article, index) => (
          <NewsCard key={index}>
            {article.image && (
              <NewsImage src={article.image} alt={article.title} />
            )}
            <NewsDetails>
              <NewsTitle>{article.title}</NewsTitle>
              <NewsContent>{article.description}</NewsContent>
              <NewsFooter>
                <NewsLink
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  자세히 보기
                </NewsLink>
                <NewsAuthor>
                  {article.author ? `By ${article.author}` : "Author unknown"}
                </NewsAuthor>
              </NewsFooter>
            </NewsDetails>
          </NewsCard>
        ))
      ) : (
        <p>해당 날짜에 대한 중요한 뉴스가 없습니다.</p>
      )}

      <CategoryHeader>일반 뉴스</CategoryHeader>
      {news.general.length > 0 ? (
        news.general.map((article, index) => (
          <NewsCard key={index}>
            {article.image && (
              <NewsImage src={article.image} alt={article.title} />
            )}
            <NewsDetails>
              <NewsTitle>{article.title}</NewsTitle>
              <NewsContent>{article.description}</NewsContent>
              <NewsFooter>
                <NewsLink
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  자세히 보기
                </NewsLink>
                <NewsAuthor>
                  {article.author ? `By ${article.author}` : "Author unknown"}
                </NewsAuthor>
              </NewsFooter>
            </NewsDetails>
          </NewsCard>
        ))
      ) : (
        <p>해당 날짜에 대한 일반 뉴스가 없습니다.</p>
      )}
      <Footer>
        &copy; 2024 stock-news APP. All rights reserved. <br />
        Developed by{" "}
        <a
          href="https://github.com/hochan222"
          target="_blank"
          rel="noopener noreferrer"
        >
          hochan222
        </a>
      </Footer>
    </Container>
  );
}

export default App;
