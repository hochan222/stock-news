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
  background: #ffffff;
  border: 1px solid #e0e0e0;
  padding: 10px;
  margin-bottom: 15px;
  border-radius: 12px;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s, box-shadow 0.3s;
  display: flex;
  align-items: center;
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
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
    </Container>
  );
}

export default App;
