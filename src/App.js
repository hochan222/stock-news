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

const DateInput = styled.input`
  display: block;
  margin: 0 auto 20px auto;
  padding: 10px;
  font-size: 1.2rem;
  border-radius: 5px;
  border: 1px solid #ccc;
`;

const ChartContainer = styled.div`
  margin-bottom: 40px;
`;

const NewsCount = styled.p`
  text-align: center;
  color: #ffffff;
`;

const NewsCard = styled.div`
  background: #fff;
  border: none;
  padding: 15px;
  margin-bottom: 20px;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s;
  &:hover {
    transform: translateY(-5px);
  }
  @media (max-width: 768px) {
    padding: 15px;
  }
`;

const NewsTitle = styled.h2`
  font-size: 1.8rem;
  color: #333;
  margin-bottom: 10px;
  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`;

const NewsContent = styled.p`
  font-size: 1.1rem;
  color: #555;
  margin-bottom: 15px;
  line-height: 1.6;
  @media (max-width: 768px) {
    font-size: 1rem;
  }
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

function App() {
  const [news, setNews] = useState({ important: [], general: [] });
  const [date, setDate] = useState("2024-10-01"); // 기본 날짜 설정 (임시로 설정)
  const [chartData, setChartData] = useState([]);
  const PUBLIC_URL = "/stock-news/build";

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

  return (
    <Container>
      <Header>주식 뉴스 및 시세 웹앱</Header>
      <DateInput
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
      />
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
            <Legend />
            <Line
              type="monotone"
              dataKey="nasdaq"
              stroke="#8884d8"
              name="나스닥"
            />
            <Line
              type="monotone"
              dataKey="kospi"
              stroke="#82ca9d"
              name="코스피"
            />
            <Line
              type="monotone"
              dataKey="bitcoin"
              stroke="#ffc658"
              name="비트코인"
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartContainer>

      <NewsCount>
        총 {(news.important?.length ?? 0) + (news.general?.length ?? 0)}개의
        뉴스가 있습니다.
      </NewsCount>

      <CategoryHeader>중요 뉴스</CategoryHeader>
      {news.important.length > 0 ? (
        news.important.map((article, index) => (
          <NewsCard key={index}>
            <NewsTitle>{article.title}</NewsTitle>
            <NewsContent>{article.description}</NewsContent>
            <NewsLink
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              자세히 보기
            </NewsLink>
          </NewsCard>
        ))
      ) : (
        <p>해당 날짜에 대한 중요한 뉴스가 없습니다.</p>
      )}

      <CategoryHeader>일반 뉴스</CategoryHeader>
      {news.general.length > 0 ? (
        news.general.map((article, index) => (
          <NewsCard key={index}>
            <NewsTitle>{article.title}</NewsTitle>
            <NewsContent>{article.description}</NewsContent>
            <NewsLink
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              자세히 보기
            </NewsLink>
          </NewsCard>
        ))
      ) : (
        <p>해당 날짜에 대한 일반 뉴스가 없습니다.</p>
      )}
    </Container>
  );
}

export default App;
