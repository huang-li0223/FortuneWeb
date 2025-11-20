// 檔案: fortune-api/server.js

const express = require('express');
const axios = require('axios');
require('dotenv').config(); // 載入 .env 檔案中的環境變數

const app = express();
const PORT = process.env.PORT || 4000; // API 伺服器運行在 Port 4000

// 確保 JSON 格式的請求體可以被解析
app.use(express.json());

// ⚠️ CORS 設定：允許您的前端 React 專案 (預設 Port 3000) 存取此 API
app.use((req, res, next) => {
    // 這裡替換成您前端的網址，開發階段用 * 也可以，但生產環境要嚴格設定
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3001'); 
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

// --- 替換成您要串接的 AI API Key ---
const RAPID_API_KEY = process.env.RAPID_API_KEY; 

// 🎯 API 代理路由：獲取每日星座運勢
app.get('/api/fortune', async (req, res) => {
    // 從前端的 URL 參數中獲取星座名稱
    const { zodiac } = req.query; 

    if (!zodiac) {
        return res.status(400).json({ error: 'Missing zodiac parameter.' });
    }

    if (!RAPID_API_KEY) {
        console.error('RAPID_API_KEY is not set.');
        return res.status(500).json({ error: 'API Key not configured on the server.' });
    }
    
    // 這裡替換成您選擇的 AI 模型 API 呼叫邏輯
    const prompt = `你是一位專業的占星師。請為${zodiac}生成一段運勢，包括愛情、工作和健康三個面向，字數約150字。請用繁體中文回覆，並加上對應的表情符號。`;
    
    try {
        // --- 範例：使用 Gemini API (假設您已安裝 SDK 或直接用 HTTP) ---
        // 由於我們只示範代理結構，這裡用一個假想的 AI API 呼叫來代替
        
        /* * 實際使用 Gemini API 時，您需要安裝 @google/genai SDK
        * const { GoogleGenAI } = require('@google/genai');
        * const ai = new GoogleGenAI(GEMINI_API_KEY);
        * * const response = await ai.models.generateContent({
        * model: 'gemini-2.5-flash',
        * contents: [{ role: 'user', parts: [{ text: prompt }] }]
        * });
        * * const fortuneText = response.text;
        */

        // --- 這裡使用一個模擬的 AI 回應作為範例 ---
        // 實際開發時，請替換成真正的 API 呼叫
        const mockResponse = {
            fortune: `模擬 ${zodiac} 今日運勢：工作方面將有新的突破，但愛情上需要主動打破僵局。健康上，多喝水！💧`,
            source: 'Mock AI Model',
            date: new Date().toLocaleDateString('zh-TW'),
        };
        const fortuneText = mockResponse.fortune;


        // 4. 將 AI 模型的回應發送回前端
        res.json({ zodiac, fortune: fortuneText });

    } catch (error) {
        console.error('Error fetching fortune from AI API:', error.message);
        res.status(500).json({ 
            error: 'Failed to generate fortune.',
            details: error.message
        });
    }
});

app.listen(PORT, () => {
    console.log(`🔮 API Server running on http://localhost:${PORT}`);
});