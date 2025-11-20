// 檔案: src/components/FortuneTeller.jsx

import React, { useState } from 'react';
import './FortuneTeller.css'; 

// --- 靜態資料 (定義在組件外部) ---

const TAROT_CARDS = [
    { name: "戰車 (The Chariot)", meaning: "今日指引：突破困境、掌握方向、決心與意志力。" },
    { name: "星星 (The Star)", meaning: "今日指引：希望、靈感、治癒、對未來抱持信心。" },
    { name: "魔術師 (The Magician)", meaning: "今日指引：創造、潛能、新的開始，所有資源已到位。" },
    { name: "戀人 (The Lovers)", meaning: "今日指引：選擇、和諧、關係的建立、重大決定。" },
    { name: "死神 (Death)", meaning: "今日指引：結束與重生、轉變、告別舊有模式。" },
    { name: "世界 (The World)", meaning: "今日指引：圓滿、成功、完成、目標達成。" },
];

const ZODIAC_OPTIONS = [
    { value: "aries", label: "♈ 牡羊座" },
    { value: "taurus", label: "♉ 金牛座" },
    { value: "gemini", label: "♊ 雙子座" },
    { value: "cancer", label: "♋ 巨蟹座" },
    { value: "libra", label: "♎ 天秤座" },
    { value: "scorpio", label: "♏ 天蠍座" },
    { value: "sagittarius", label: "♐ 射手座" },
    { value: "capricorn", label: "♑ 摩羯座" },
    { value: "aquarius", label: "♒ 水瓶座" },
    { value: "pisces", label: "♓ 雙魚座" },
];


// --- 主組件定義 ---

const FortuneTeller = () => {
    // 狀態管理
    const [activeTab, setActiveTab] = useState('constellation');
    const [selectedZodiac, setSelectedZodiac] = useState(ZODIAC_OPTIONS[0].value);
    
    // 星座運勢狀態 (新增 API 相關的狀態)
    const [fortuneResult, setFortuneResult] = useState('請選擇您的星座並點擊「查看運勢」以開始。');
    const [isLoading, setIsLoading] = useState(false); 

    // 塔羅牌狀態
    const [tarotCardContent, setTarotCardContent] = useState('點擊抽牌');
    const [tarotCardRevealed, setTarotCardRevealed] = useState(false);
    const [tarotResult, setTarotResult] = useState('塔羅牌結果將在此處揭示。');

    
    // 🎯 處理星座運勢查詢 (新的 API 邏輯)
    const handleShowFortune = async () => {
        setIsLoading(true);
        setFortuneResult('🔮 正在聯繫命運之輪，請稍候...');

        // 呼叫後端 API
        const apiUrl = `http://localhost:4000/api/fortune?zodiac=${selectedZodiac}`;
        
        try {
            const response = await fetch(apiUrl);
            
            if (!response.ok) {
                throw new Error(`伺服器錯誤: ${response.status}`);
            }
            
            const data = await response.json();
            
            const selectedLabel = ZODIAC_OPTIONS.find(opt => opt.value === selectedZodiac)?.label || '星座';
            const fortuneText = data.fortune;
            
            setFortuneResult(`<h3>${selectedLabel} 今日運勢：</h3><p>${fortuneText}</p>`);

        } catch (error) {
            console.error('API 呼叫失敗:', error);
            setFortuneResult(`<p style="color: red;">❌ 運勢讀取失敗。請確認後端 API 伺服器 (Port 4000) 是否已啟動。</p>`);
        } finally {
            setIsLoading(false);
        }
    };

    // 處理塔羅牌占卜 (原邏輯，保留靜態資料)
    const handleDrawTarot = () => {
        if (tarotCardRevealed) return;

        const randomIndex = Math.floor(Math.random() * TAROT_CARDS.length);
        const drawnCard = TAROT_CARDS[randomIndex];
        
        setTarotCardContent(drawnCard.name);
        setTarotCardRevealed(true);
        
        setTarotResult(`
            <h3>🔮 恭喜抽到 【${drawnCard.name}】 牌</h3>
            <p>${drawnCard.meaning}</p>
            <p style="font-size: 14px; margin-top: 10px;">請將結果視為今日的建議與指引。</p>
        `);
        
        setTimeout(() => {
            setTarotCardContent('點擊抽牌');
            setTarotCardRevealed(false);
            setTarotResult('塔羅牌結果將在此處揭示。');
        }, 5000); 
    };
    
    // --- 輔助渲染函式 ---
    
    // 星座運勢區塊 (更新按鈕禁用狀態)
    const renderConstellationSection = () => (
        <section id="constellation" className="content-section active">
            <h2>今日星座運勢 ✨</h2>
            <div className="zodiac-selector">
                <label htmlFor="zodiac-select">請選擇您的星座:</label>
                <select 
                    id="zodiac-select" 
                    value={selectedZodiac} 
                    onChange={(e) => setSelectedZodiac(e.target.value)}
                    disabled={isLoading} // 載入時禁用選擇
                >
                    {ZODIAC_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>
                <button 
                    onClick={handleShowFortune} 
                    id="show-fortune-btn" 
                    disabled={isLoading} // 正在載入時禁用按鈕
                >
                    {isLoading ? '運算中...' : '查看運勢'}
                </button>
            </div>
            
            <div 
                id="fortune-output" 
                className="result-box"
                // 這裡我們需要判斷是否正在載入，以避免頁面閃爍
                dangerouslySetInnerHTML={{ __html: fortuneResult }}
            ></div>
        </section>
    );
    
    // ... (renderTarotSection 和 renderInfoSection 保持不變)
    const renderTarotSection = () => ( /* ... 塔羅牌渲染邏輯 ... */
        <section id="tarot" className="content-section">
            <h2>🔮 線上塔羅抽牌 </h2>
            {/* ... 略 ... */}
            <div className="tarot-area">
                <div 
                    id="tarot-card" 
                    className={tarotCardRevealed ? 'card-reveal' : 'card-back'}
                    onClick={handleDrawTarot}
                >
                    {tarotCardContent}
                </div>
            </div>
            
            <button onClick={handleDrawTarot} id="draw-tarot-btn" disabled={tarotCardRevealed}>
                {tarotCardRevealed ? '已抽取 (5秒後可再抽)' : '抽取今日塔羅牌'}
            </button>
            
            <div 
                id="tarot-result" 
                className="result-box"
                dangerouslySetInnerHTML={{ __html: tarotResult }}
            ></div>
        </section>
    );

    const renderInfoSection = () => ( /* ... 星座介紹渲染邏輯 ... */
        <section id="info" className="content-section">
            <h2>📖 十二星座特質 </h2>
            <div className="constellation-grid">
                {ZODIAC_OPTIONS.map(opt => (
                    <div className="constellation-card" key={opt.value}>
                        <h3>{opt.label}</h3>
                        <p>關鍵詞：請在這裡填寫您的星座特質描述。</p>
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
                    {/* 導航按鈕邏輯保持不變 */}
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