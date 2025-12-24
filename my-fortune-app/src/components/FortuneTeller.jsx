// src/components/FortuneTeller.jsx
import React, { useState, useCallback, useEffect } from 'react';
import './FortuneTeller.css';
import { Converter } from 'opencc-js';

// 簡體轉繁體
const converter = Converter({ from: 'cn', to: 'tw' });

// ⭐ Roxy API Token
const API_TOKEN = 'bac9a0c9-1302-4495-b84b-062f21a64921';

// ⭐ NASA API Key
const NASA_API_KEY = 't9Z5pJEV980lItvNoFknpSKBeqtLMnaPAP7akzg4';

// ----------------------------------------------------
// 🌟 翻譯輔助函式（改用本地 server）
const translateToChinese = async (text) => {
  if (!text || typeof text !== 'string' || text.trim() === '') return text;

  try {
    const res = await fetch('http://localhost:3001/api/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    });

    const data = await res.json();
    return converter(data.text || text);

  } catch (err) {
    console.warn('翻譯失敗，使用原文：', err);
    return text;
  }
};

// ----------------------------------------------------
// 星座與時間選項
const ZODIAC_OPTIONS = [
  { value: "aries", label: "♈ 牡羊座" },
  { value: "taurus", label: "♉ 金牛座" },
  { value: "gemini", label: "♊ 雙子座" },
  { value: "cancer", label: "♋ 巨蟹座" },
  { value: "leo", label: "♌ 獅子座" },
  { value: "virgo", label: "♍ 處女座" },
  { value: "libra", label: "♎ 天秤座" },
  { value: "scorpio", label: "♏ 天蠍座" },
  { value: "sagittarius", label: "♐ 射手座" },
  { value: "capricorn", label: "♑ 摩羯座" },
  { value: "aquarius", label: "♒ 水瓶座" },
  { value: "pisces", label: "♓ 雙魚座" },
];

const TIME_OPTIONS = [
  { value: "today", label: "今日" },
  { value: "week", label: "本週" },
  { value: "month", label: "本月" },
];

// ----------------------------------------------------
// FortuneTeller 主程式
const FortuneTeller = () => {
  const [activeTab, setActiveTab] = useState('constellation');

  // 星座運勢
  const [selectedZodiac, setSelectedZodiac] = useState(ZODIAC_OPTIONS[0].value);
  const [selectedTime, setSelectedTime] = useState(TIME_OPTIONS[0].value);
  const [fortuneResult, setFortuneResult] = useState({ title: '請選擇星座並查看運勢', content: '' });
  const [isLoading, setIsLoading] = useState(false);

  // 星座特質
  const [traitsData, setTraitsData] = useState({});
  const [isTraitsLoading, setIsTraitsLoading] = useState(false);

  // 塔羅牌
  const [tarotCards, setTarotCards] = useState([]);
  const [isTarotLoading, setIsTarotLoading] = useState(false);

  // NASA APOD
  const [nasaData, setNasaData] = useState(null);
  const [isNasaLoading, setIsNasaLoading] = useState(false);
  const [nasaError, setNasaError] = useState(null);

  // ---------------------- 星座運勢 ----------------------
  const handleShowFortune = useCallback(async () => {
    setIsLoading(true);
    setFortuneResult({ title: '🔮 正在聯繫命運之輪...', content: '' });

    try {
      const res = await fetch(
        `https://v2.xxapi.cn/api/horoscope?type=${selectedZodiac}&time=${selectedTime}`
      );
      const data = await res.json();

      let fortuneText = data.data?.fortunetext?.all || '運勢暫無資料';
      fortuneText = converter(fortuneText);

      setFortuneResult({
        title: `${ZODIAC_OPTIONS.find(z => z.value === selectedZodiac)?.label} ${TIME_OPTIONS.find(t => t.value === selectedTime)?.label} 運勢：`,
        content: fortuneText
      });

    } catch (err) {
      setFortuneResult({ title: '❌ 運勢讀取失敗', content: '請稍後再試。' });
    }
    setIsLoading(false);
  }, [selectedZodiac, selectedTime]);

  // ---------------------- 星座特質 ----------------------
  const fetchAllZodiacTraits = useCallback(async () => {
    setIsTraitsLoading(true);
    const result = {};

    for (const zodiac of ZODIAC_OPTIONS) {
      try {
        const res = await fetch(
          `https://roxyapi.com/api/v1/data/astro/astrology/zodiac/${zodiac.value}?token=${API_TOKEN}`
        );
        const data = await res.json();

        result[zodiac.value] = {
          element: await translateToChinese(data.element || ""),
          personality: await translateToChinese(data.personality || "")
        };

      } catch {
        result[zodiac.value] = null;
      }
    }

    setTraitsData(result);
    setIsTraitsLoading(false);
  }, []);

  useEffect(() => {
    fetchAllZodiacTraits();
  }, [fetchAllZodiacTraits]);

  // ---------------------- 塔羅牌 ----------------------
  const handleDrawTarot = async () => {
    setIsTarotLoading(true);
    setTarotCards([]);

    try {
      const res = await fetch(
        `https://roxyapi.com/api/v1/data/astro/tarot/three-card-draw?token=${API_TOKEN}`
      );
      const data = await res.json();

      const cards = await Promise.all(
        data.map(async (card) => ({
          name: await translateToChinese(card.name),
          meaning: await translateToChinese(
            card.is_reversed ? card.reversed_meaning || card.meaning : card.meaning
          ),
          imageUrl: card.image,
          isReversed: card.is_reversed
        }))
      );

      setTarotCards(cards);

    } catch {
      alert('抽牌失敗');
    }

    setIsTarotLoading(false);
  };

  // ---------------------- NASA ----------------------
  const fetchNasaApod = useCallback(async () => {
    setIsNasaLoading(true);

    try {
      const res = await fetch(
        `https://api.nasa.gov/planetary/apod?api_key=${NASA_API_KEY}`
      );
      const data = await res.json();

      setNasaData({
        ...data,
        explanation: await translateToChinese(data.explanation || "")
      });

    } catch {
      setNasaError('NASA 讀取失敗');
    }

    setIsNasaLoading(false);
  }, []);

  useEffect(() => {
    if (activeTab === 'nasa' && !nasaData) fetchNasaApod();
  }, [activeTab, fetchNasaApod, nasaData]);

  return (
    <>
      <header>
        <h1>🌟 命運之輪 🌟</h1>
        <nav>
          <button
            className={`nav-btn ${activeTab === 'constellation' ? 'active' : ''}`}
            onClick={() => setActiveTab('constellation')}
          >
            星座運勢
          </button>
          <button
            className={`nav-btn ${activeTab === 'tarot' ? 'active' : ''}`}
            onClick={() => setActiveTab('tarot')}
          >
            塔羅占卜
          </button>
          <button
            className={`nav-btn ${activeTab === 'info' ? 'active' : ''}`}
            onClick={() => setActiveTab('info')}
          >
            星座介紹
          </button>
          <button
            className={`nav-btn ${activeTab === 'nasa' ? 'active' : ''}`}
            onClick={() => setActiveTab('nasa')}
          >
            NASA 太空
          </button>
        </nav>
      </header>

      <main>
        {activeTab === 'constellation' && (
          <section className="content-section">
            <div className="zodiac-selector">
              <select value={selectedZodiac} onChange={(e) => setSelectedZodiac(e.target.value)}>
                {ZODIAC_OPTIONS.map(z => (
                  <option key={z.value} value={z.value}>{z.label}</option>
                ))}
              </select>
              <select value={selectedTime} onChange={(e) => setSelectedTime(e.target.value)}>
                {TIME_OPTIONS.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
              <button onClick={handleShowFortune}>查看運勢</button>
            </div>
            {isLoading ? <p>讀取中...</p> :
              <div className="result-box">
                <h3>{fortuneResult.title}</h3>
                <p>{fortuneResult.content}</p>
              </div>
            }
          </section>
        )}

        {activeTab === 'info' && (
          <section className="content-section constellation-grid">
            {ZODIAC_OPTIONS.map(z => (
              <div className="constellation-card" key={z.value}>
                <h3>{z.label}</h3>
                <p>{traitsData[z.value]?.personality}</p>
              </div>
            ))}
          </section>
        )}

        {activeTab === 'tarot' && (
          <section className="content-section">
            <button className="tarot-btn" onClick={handleDrawTarot} disabled={isTarotLoading}>
              {isTarotLoading ? '抽牌中...' : '抽塔羅牌'}
            </button>
            <div className="tarot-area">
              {tarotCards.map((card, idx) => (
                <div className="tarot-card" key={idx}>
                  <div className="tarot-card-image">
                    <img src={card.imageUrl} alt={card.name} />
                  </div>
                  <h3>{card.name} {card.isReversed ? '（逆位）' : ''}</h3>
                  <p>{card.meaning}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {activeTab === 'nasa' && (
          <section className="content-section">
            {isNasaLoading && <p>讀取中...</p>}
            {nasaError && <p>{nasaError}</p>}
            {nasaData && (
              <>
                <h3>{nasaData.title}</h3>
                <img src={nasaData.url} alt={nasaData.title} style={{ maxWidth: '100%', borderRadius: '15px', marginTop: '20px' }} />
                <p style={{ marginTop: '15px', color: '#f5deb3' }}>{nasaData.explanation}</p>
              </>
            )}
          </section>
        )}
      </main>

      <footer>
        © 2025 命運之輪. All Rights Reserved.
      </footer>
    </>
  );
};

export default FortuneTeller;
