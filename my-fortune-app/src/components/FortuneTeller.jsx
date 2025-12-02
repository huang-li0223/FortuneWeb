// 檔案: src/components/FortuneTeller.jsx
import React, { useState, useCallback } from 'react';
import './FortuneTeller.css';

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

const FortuneTeller = () => {
    const [activeTab, setActiveTab] = useState('constellation');
    const [selectedZodiac, setSelectedZodiac] = useState(ZODIAC_OPTIONS[0].value);
    const [fortuneResult, setFortuneResult] = useState({ title: '請選擇您的星座並點擊「查看運勢」以開始。', content: '' });
    const [isLoading, setIsLoading] = useState(false);

    const [tarotCardRevealed, setTarotCardRevealed] = useState(false);
    const [tarotResult, setTarotResult] = useState({ title: '塔羅牌結果將在此處揭示。', meaning: '', cardName: '', imageUrl: '' });

    const handleShowFortune = useCallback(async () => {
        setIsLoading(true);
        setFortuneResult({ title: '🔮 正在聯繫命運之輪，請稍候...', content: '' });
        const apiUrl = `http://localhost:4000/api/fortune?zodiac=${selectedZodiac}`;

        try {
            const response = await fetch(apiUrl);
            if (!response.ok) throw new Error(`伺服器錯誤: ${response.status}`);
            const data = await response.json();
            const selectedLabel = ZODIAC_OPTIONS.find(opt => opt.value === selectedZodiac)?.label || '星座';
            
            setFortuneResult({ 
                title: `${selectedLabel} 今日運勢：`, 
                content: data.fortune 
            });

        } catch (error) {
            console.error(error);
            setFortuneResult({
                title: '❌ 運勢讀取失敗。',
                content: '請確認 API 伺服器是否啟動。'
            });
        } finally {
            setIsLoading(false);
        }
    }, [selectedZodiac]);

    const resetTarot = () => {
        setTarotCardRevealed(false);
        setTarotResult({ title: '塔羅牌結果將在此處揭示。', meaning: '', cardName: '', imageUrl: '' });
    };

    const handleDrawTarot = async () => {
        if (tarotCardRevealed) {
            resetTarot();
            return;
        }

        try {
            const response = await fetch('https://tarotapi.dev/api/v1/cards/random?n=1');
            if (!response.ok) throw new Error(`塔羅 API 錯誤: ${response.status}`);
            const data = await response.json();

            const card = data.cards[0];
            const meaning = card.meaning_up || card.meaning_rev || '無解釋';

            setTarotCardRevealed(true);
            setTarotResult({
                title: `🔮 恭喜抽到 【${card.name}】`,
                meaning: meaning,
                cardName: card.name,
                imageUrl: card.image
            });
        } catch (error) {
            console.error(error);
            setTarotResult({
                title: '❌ 塔羅牌抽取失敗',
                meaning: '請檢查網路或 API 是否可用',
                cardName: '',
                imageUrl: ''
            });
        }
    };

    const renderConstellationSection = () => (
        <section className="content-section active">
            <h2>今日星座運勢 ✨</h2>
            <div className="zodiac-selector">
                <label htmlFor="zodiac-select">請選擇星座:</label>
                <select id="zodiac-select" value={selectedZodiac} onChange={(e) => setSelectedZodiac(e.target.value)} disabled={isLoading}>
                    {ZODIAC_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
                <button id="show-fortune-btn" onClick={handleShowFortune} disabled={isLoading}>
                    {isLoading ? '運算中...' : '查看運勢'}
                </button>
            </div>
            <div className="result-box">
                <h3>{fortuneResult.title}</h3>
                {fortuneResult.content && <p>{fortuneResult.content}</p>}
            </div>
        </section>
    );

    const renderTarotSection = () => (
        <section className="content-section">
            <h2>🔮 線上塔羅抽牌</h2>
            <div className="tarot-area">
                <div id="tarot-card" className={tarotCardRevealed ? 'card-reveal' : ''} onClick={handleDrawTarot}>
                    <div className="card-back">點擊抽牌</div>
                    <div className="card-front">
                        {tarotResult.imageUrl && <img src={tarotResult.imageUrl} alt={tarotResult.cardName} />}
                        {!tarotResult.imageUrl && '點擊抽牌'}
                    </div>
                </div>
            </div>
            <button id="draw-tarot-btn" onClick={handleDrawTarot}>
                {tarotCardRevealed ? '重新抽牌' : '抽取今日塔羅牌'}
            </button>
            <div className="result-box">
                <h3>{tarotResult.title}</h3>
                {tarotResult.meaning && <p>{tarotResult.meaning}</p>}
            </div>
        </section>
    );

    const renderInfoSection = () => (
        <section className="content-section">
            <h2>📖 十二星座特質</h2>
            <div className="constellation-grid">
                {ZODIAC_OPTIONS.map(opt => (
                    <div className="constellation-card" key={opt.value}>
                        <h3>{opt.label}</h3>
                        <p>關鍵詞：請填寫您的星座特質描述。</p>
                    </div>
                ))}
            </div>
        </section>
    );

    return (
        <>
            <header>
                <h1>🌟 命運之輪 🌟</h1>
                <nav>
                    <button className={`nav-btn ${activeTab === 'constellation' ? 'active' : ''}`} onClick={() => setActiveTab('constellation')}>星座運勢</button>
                    <button className={`nav-btn ${activeTab === 'tarot' ? 'active' : ''}`} onClick={() => setActiveTab('tarot')}>塔羅占卜</button>
                    <button className={`nav-btn ${activeTab === 'info' ? 'active' : ''}`} onClick={() => setActiveTab('info')}>星座介紹</button>
                </nav>
            </header>
            <main>
                {activeTab === 'constellation' && renderConstellationSection()}
                {activeTab === 'tarot' && renderTarotSection()}
                {activeTab === 'info' && renderInfoSection()}
            </main>
            <footer>
                <p>&copy; 2025 命運之輪魔法屋。所有內容僅供娛樂參考。</p>
            </footer>
        </>
    );
};

export default FortuneTeller;

