<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Happy Kids English - 快樂小學堂 🎓

一個互動式、AI 驅動的學習應用程式，專為小學生（1-6 年級）設計，支援英語、數學、寫作和自然科學四大科目。

## ✨ 特色功能

- 🤖 **AI 生成內容**：使用 Google Gemini AI 動態生成適齡教學內容
- 🎮 **多樣化遊戲**：連連看、拼字、數學挑戰等多種互動遊戲
- 🔒 **隱私優先**：API Key 只儲存在您的瀏覽器本機
- 💰 **完全免費**：使用您自己的 Google Gemini API 免費配額

## 🚀 快速開始

### 前置需求
- Node.js (建議 v18 或以上)
- Google Gemini API Key（免費申請）

### 安裝步驟

1. **安裝相依套件**
   ```bash
   npm install
   ```

2. **啟動開發伺服器**
   ```bash
   npm run dev
   ```

3. **設定 API Key**
   - 開啟瀏覽器訪問 http://localhost:3000
   - 首次使用會自動彈出 API Key 設定視窗
   - 前往 [Google AI Studio](https://aistudio.google.com/apikey) 申請免費 API Key
   - 將 API Key 貼到設定視窗中
   - 點擊「儲存並開始使用」

📖 **詳細的 API Key 申請教學請參考：[API_KEY_GUIDE.md](./API_KEY_GUIDE.md)**

## 🔑 關於 API Key

本應用程式採用「使用者自行管理 API Key」的設計：

- ✅ **安全**：您的 API Key 只儲存在瀏覽器 localStorage，不會傳送到任何伺服器
- ✅ **免費**：使用 Google Gemini 的免費配額（每天 1,500 次請求）
- ✅ **隱私**：我們不收集任何資料，完全在本機運作
- ✅ **開源**：程式碼完全透明，可自行檢視

## 📚 使用說明

1. 選擇科目（英語、數學、寫作、自然）
2. 選擇年級（1-6 年級）
3. 選擇主題或讓 AI 隨機生成
4. 開始學習和遊戲！

## 🛠️ 技術架構

- **前端框架**：React 19 + TypeScript
- **AI 服務**：Google Gemini API
- **樣式**：Tailwind CSS
- **建置工具**：Vite

## 📝 授權

本專案為開源專案，歡迎自由使用和修改。

## 🤝 貢獻

歡迎提交 Issue 和 Pull Request！

---

**Made with ❤️ for kids learning**
