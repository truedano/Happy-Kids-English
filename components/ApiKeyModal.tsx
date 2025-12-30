import React, { useState } from 'react';

interface ApiKeyModalProps {
    onSave: (apiKey: string) => void;
    onClose?: () => void;
    isOpen: boolean;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ onSave, onClose, isOpen }) => {
    const [apiKey, setApiKey] = useState('');
    const [showKey, setShowKey] = useState(false);
    const [isValidating, setIsValidating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleSave = async () => {
        setError(null);

        // 基本格式驗證
        if (!apiKey.trim()) {
            setError('請輸入 API Key');
            return;
        }

        if (apiKey.length < 20) {
            setError('API Key 格式不正確（長度太短）');
            return;
        }

        setIsValidating(true);

        try {
            // 測試 API Key 是否有效
            const { GoogleGenAI } = await import('@google/genai');
            const testClient = new GoogleGenAI({ apiKey: apiKey.trim() });

            // 嘗試呼叫 API 驗證
            await testClient.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: 'test',
                config: {
                    temperature: 0.1,
                }
            });

            // 驗證成功，儲存金鑰
            onSave(apiKey.trim());
            setApiKey('');
            setError(null);
        } catch (err: any) {
            console.error('API Key 驗證失敗:', err);
            if (err.message?.includes('API key')) {
                setError('❌ API Key 無效，請檢查是否正確');
            } else if (err.message?.includes('quota')) {
                setError('⚠️ API 配額已用完，請檢查您的 Google Cloud 帳單');
            } else {
                setError('❌ 驗證失敗，請稍後再試');
            }
        } finally {
            setIsValidating(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !isValidating) {
            handleSave();
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-8 animate-fade-in-up">
                {/* Header */}
                <div className="text-center mb-6">
                    <div className="text-6xl mb-4 animate-bounce-slow">🔑</div>
                    <h2 className="text-3xl font-bold text-gray-800 mb-2">設定 API Key</h2>
                    <p className="text-gray-500 font-medium">
                        為了使用 AI 功能，您需要提供 Google Gemini API Key
                    </p>
                </div>

                {/* 說明區塊 */}
                <div className="bg-sky-50 rounded-2xl p-6 mb-6 border border-sky-100">
                    <h3 className="font-bold text-gray-700 mb-3 flex items-center gap-2">
                        <span>💡</span>
                        <span>如何取得 API Key？</span>
                    </h3>
                    <ol className="space-y-2 text-sm text-gray-600">
                        <li className="flex items-start gap-2">
                            <span className="font-bold text-sky-600 min-w-[20px]">1️⃣</span>
                            <span>前往 <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer" className="text-sky-600 underline font-bold hover:text-sky-700">Google AI Studio</a></span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="font-bold text-sky-600 min-w-[20px]">2️⃣</span>
                            <span>點擊「Create API Key」建立新的金鑰</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="font-bold text-sky-600 min-w-[20px]">3️⃣</span>
                            <span>複製金鑰並貼到下方輸入框</span>
                        </li>
                    </ol>
                </div>

                {/* 輸入區塊 */}
                <div className="mb-6">
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                        您的 API Key
                    </label>
                    <div className="relative">
                        <input
                            type={showKey ? 'text' : 'password'}
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="貼上您的 Gemini API Key..."
                            className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-xl focus:border-sky-500 focus:outline-none font-mono text-sm"
                            disabled={isValidating}
                        />
                        <button
                            type="button"
                            onClick={() => setShowKey(!showKey)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                            disabled={isValidating}
                        >
                            {showKey ? '🙈' : '👁️'}
                        </button>
                    </div>
                    {error && (
                        <div className="mt-2 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg border border-red-100">
                            {error}
                        </div>
                    )}
                </div>

                {/* 安全提示 */}
                <div className="bg-green-50 rounded-xl p-4 mb-6 border border-green-100">
                    <p className="text-xs text-green-700 flex items-start gap-2">
                        <span className="text-base">🔒</span>
                        <span>
                            <strong>隱私保證：</strong>您的 API Key 只會儲存在您的瀏覽器本機（localStorage），
                            我們不會收集或傳送到任何伺服器。
                        </span>
                    </p>
                </div>

                {/* 按鈕區 */}
                <div className="flex gap-3">
                    <button
                        onClick={handleSave}
                        disabled={isValidating || !apiKey.trim()}
                        className={`flex-1 py-3 rounded-xl font-bold text-lg shadow-md transition-all ${isValidating || !apiKey.trim()
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : 'bg-sky-500 text-white hover:bg-sky-600 active:scale-95'
                            }`}
                    >
                        {isValidating ? (
                            <span className="flex items-center justify-center gap-2">
                                <span className="animate-spin">⏳</span>
                                驗證中...
                            </span>
                        ) : (
                            '✅ 儲存並開始使用'
                        )}
                    </button>
                    {onClose && (
                        <button
                            onClick={onClose}
                            disabled={isValidating}
                            className="px-6 py-3 rounded-xl font-bold text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-50"
                        >
                            取消
                        </button>
                    )}
                </div>

                {/* FAQ 連結 */}
                <div className="mt-6 text-center">
                    <a
                        href="https://ai.google.dev/gemini-api/docs/api-key"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-gray-400 hover:text-gray-600 underline"
                    >
                        📖 查看 API Key 詳細說明
                    </a>
                </div>
            </div>
        </div>
    );
};
