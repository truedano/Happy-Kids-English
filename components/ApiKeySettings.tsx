import React, { useState } from 'react';
import { validateApiKeyFormat } from '../services/apiKeyManager';
import { GEMINI_MODEL } from '../services/geminiService';

interface ApiKeySettingsProps {
    apiKeys: string[];
    onUpdate: (newPool: string[]) => void;
    onClear: () => void;
}

export const ApiKeySettings: React.FC<ApiKeySettingsProps> = ({
    apiKeys,
    onUpdate,
    onClear
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [showKeys, setShowKeys] = useState(false);
    const [newApiKey, setNewApiKey] = useState('');
    const [isAdding, setIsAdding] = useState(false);

    const [isValidating, setIsValidating] = useState(false);

    const handleAdd = async () => {
        const key = newApiKey.trim();
        const validation = validateApiKeyFormat(key);

        if (!key) return;

        if (!validation.valid) {
            alert(validation.error || '金鑰格式不正確');
            return;
        }

        if (apiKeys.includes(key)) {
            alert('此金鑰已在清單中');
            setNewApiKey('');
            setIsAdding(false);
            return;
        }

        setIsValidating(true);
        try {
            const { GoogleGenAI } = await import('@google/genai');
            const testClient = new GoogleGenAI({ apiKey: key });

            // 使用導出的常數進行驗證
            await testClient.models.generateContent({
                model: GEMINI_MODEL,
                contents: 'test',
            });

            // 驗證成功才加入
            onUpdate([...apiKeys, key]);
            setNewApiKey('');
            setIsAdding(false);
        } catch (err: any) {
            console.error('API Key 驗證失敗:', err);
            alert('❌ 金鑰驗證失敗：此金鑰無效或配額已滿');
        } finally {
            setIsValidating(false);
        }
    };

    const handleRemove = (keyToRemove: string) => {
        onUpdate(apiKeys.filter(k => k !== keyToRemove));
    };

    const handleClear = () => {
        if (confirm('確定要清除所有 API Key 嗎？')) {
            onClear();
            setIsOpen(false);
        }
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-gray-600 hover:text-gray-800 transition-all active:scale-95"
                title="API 設定"
            >
                <span className="text-2xl">⚙️</span>
                {apiKeys.length === 0 && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse border-2 border-white"></span>
                )}
                {apiKeys.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-sky-500 text-white text-[10px] font-bold px-1 rounded-full border-2 border-white min-w-[18px] text-center">
                        {apiKeys.length}
                    </span>
                )}
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
                    <div className="absolute right-0 top-full mt-3 w-80 bg-white/90 backdrop-blur-md rounded-[2rem] shadow-2xl border border-gray-100 p-6 z-50 animate-fade-in-up">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                <span>🚀</span>
                                <span>輪詢設定</span>
                            </h3>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${apiKeys.length > 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                                }`}>
                                {apiKeys.length > 0 ? '運作中' : '未啟動'}
                            </span>
                        </div>

                        {/* 金鑰清單預覽 */}
                        <div className="space-y-2 mb-4 max-h-48 overflow-y-auto pr-1">
                            {apiKeys.length === 0 ? (
                                <p className="text-xs text-gray-400 text-center py-4 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                    尚未設定任何金鑰
                                </p>
                            ) : (
                                apiKeys.map((key, idx) => (
                                    <div key={idx} className="flex items-center justify-between bg-gray-50 p-2 rounded-xl border border-gray-100 group">
                                        <span className="text-[10px] font-mono text-gray-500 truncate mr-2">
                                            {showKeys ? key : `${key.slice(0, 6)}...${key.slice(-4)}`}
                                        </span>
                                        <button
                                            onClick={() => handleRemove(key)}
                                            className="text-gray-300 hover:text-red-500 transition-colors"
                                        >
                                            <span className="text-xs">🗑️</span>
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* 操作區 */}
                        <div className="space-y-2 pt-4 border-t border-gray-100">
                            {isAdding ? (
                                <div className="animate-fade-in">
                                    <input
                                        type="text"
                                        value={newApiKey}
                                        onChange={(e) => setNewApiKey(e.target.value)}
                                        placeholder="貼上新的 API Key..."
                                        className="w-full px-3 py-2 border-2 border-sky-100 rounded-xl focus:border-sky-500 focus:outline-none font-mono text-xs mb-2 transition-all"
                                        autoFocus
                                    />
                                    <div className="flex gap-2">
                                        <button
                                            onClick={handleAdd}
                                            disabled={!newApiKey.trim() || isValidating}
                                            className="flex-1 bg-sky-500 text-white py-2 rounded-xl font-bold text-xs hover:bg-sky-600 transition-all disabled:opacity-50"
                                        >
                                            {isValidating ? '驗證中...' : '確定新增'}
                                        </button>
                                        <button
                                            onClick={() => { setIsAdding(false); setNewApiKey(''); }}
                                            className="px-3 py-2 text-xs font-bold text-gray-400 hover:bg-gray-100 rounded-xl"
                                        >
                                            取消
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <button
                                        onClick={() => setIsAdding(true)}
                                        className="w-full bg-sky-50 text-sky-600 py-3 rounded-2xl font-bold text-sm hover:bg-sky-100 transition-all flex items-center justify-center gap-2"
                                    >
                                        <span>➕</span>
                                        <span>新增金鑰</span>
                                    </button>

                                    {apiKeys.length > 0 && (
                                        <button
                                            onClick={handleClear}
                                            className="w-full text-red-400 py-2 rounded-xl text-[10px] font-bold hover:text-red-600 transition-all uppercase tracking-widest mt-2"
                                        >
                                            徹底清除所有金鑰
                                        </button>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </>
            )}
        </>
    );
};

