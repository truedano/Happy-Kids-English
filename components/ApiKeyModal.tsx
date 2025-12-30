import React, { useState, useEffect } from 'react';
import { getApiKeyPool, validateApiKeyFormat } from '../services/apiKeyManager';

interface ApiKeyModalProps {
    onSave: (apiKeys: string[]) => void;
    onClose?: () => void;
    isOpen: boolean;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ onSave, onClose, isOpen }) => {
    const [inputKey, setInputKey] = useState('');
    const [keyPool, setKeyPool] = useState<string[]>([]);
    const [showKeys, setShowKeys] = useState(false);
    const [isValidating, setIsValidating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // 開啟時載入現有的金鑰池
    useEffect(() => {
        if (isOpen) {
            setKeyPool(getApiKeyPool());
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleAddKeys = () => {
        setError(null);
        if (!inputKey.trim()) {
            setError('請輸入 API Key');
            return;
        }

        // 支援多行貼上，以換行或逗號拆分
        const lines = inputKey.split(/[\n,]+/).map(k => k.trim()).filter(k => k.length > 0);
        const newValidKeys: string[] = [];
        const invalidKeys: string[] = [];

        lines.forEach(key => {
            const validation = validateApiKeyFormat(key);
            if (validation.valid && !keyPool.includes(key)) {
                newValidKeys.push(key);
            } else if (!validation.valid) {
                invalidKeys.push(key);
            }
        });

        if (invalidKeys.length > 0) {
            setError(`有 ${invalidKeys.length} 組金鑰格式不正確`);
        }

        if (newValidKeys.length > 0) {
            setKeyPool(prev => [...prev, ...newValidKeys]);
            setInputKey('');
        } else if (invalidKeys.length === 0) {
            setError('金鑰已存在或無效');
        }
    };

    const handleRemoveKey = (keyToRemove: string) => {
        setKeyPool(prev => prev.filter(k => k !== keyToRemove));
    };

    const handleSave = async () => {
        if (keyPool.length === 0) {
            setError('請至少加入一組 API Key');
            return;
        }

        setIsValidating(true);
        setError(null);

        try {
            const { GoogleGenAI } = await import('@google/genai');
            const { GEMINI_MODEL } = await import('../services/geminiService');
            const invalidIndices: number[] = [];

            // 逐一測試所有金鑰
            for (let i = 0; i < keyPool.length; i++) {
                try {
                    const testClient = new GoogleGenAI({ apiKey: keyPool[i] });
                    // 使用導出的常數進行驗證
                    await testClient.models.generateContent({
                        model: GEMINI_MODEL,
                        contents: 'test',
                    });
                } catch (err: any) {
                    console.error(`第 ${i + 1} 組金鑰驗證失敗:`, err);
                    invalidIndices.push(i + 1);
                }
            }

            if (invalidIndices.length > 0) {
                setError(`❌ 驗證失敗：第 ${invalidIndices.join(', ')} 組金鑰無效或配額問題，請修正或移除後再儲存。`);
            } else {
                // 全部通過驗證，儲存所有金鑰
                onSave(keyPool);
                setError(null);
            }
        } catch (err: any) {
            console.error('API Key 驗證過程發生錯誤:', err);
            setError('❌ 驗證過程中發生非預期錯誤，請稍後再試');
        } finally {
            setIsValidating(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleAddKeys();
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-white rounded-[2rem] shadow-2xl max-w-2xl w-full p-8 animate-fade-in-up border border-white/20">
                {/* Header */}
                <div className="text-center mb-6">
                    <div className="text-6xl mb-4 animate-bounce-slow">🔄</div>
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-sky-600 to-teal-600 bg-clip-text text-transparent mb-2">
                        輪詢金鑰管理
                    </h2>
                    <p className="text-gray-500 font-medium">
                        輸入多組 Gemini API Key，系統將自動輪替以分散配額壓力
                    </p>
                </div>

                {/* 輸入區塊 */}
                <div className="mb-6">
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                        新增 API Key (支援多行貼上)
                    </label>
                    <div className="relative group">
                        <textarea
                            value={inputKey}
                            onChange={(e) => setInputKey(e.target.value)}
                            onKeyDown={handleKeyPress}
                            placeholder="貼上金鑰後按 Enter 或點擊「加入」..."
                            className="w-full px-4 py-3 pr-24 border-2 border-gray-100 rounded-2xl focus:border-sky-500 focus:ring-4 focus:ring-sky-50 outline-none font-mono text-sm transition-all min-h-[100px] bg-gray-50/50"
                            disabled={isValidating}
                        />
                        <button
                            onClick={handleAddKeys}
                            disabled={!inputKey.trim()}
                            className="absolute right-3 bottom-3 bg-sky-500 text-white px-4 py-2 rounded-xl font-bold text-sm shadow-md hover:bg-sky-600 active:scale-95 disabled:opacity-0 transition-all"
                        >
                            加入清單
                        </button>
                    </div>
                </div>

                {/* 金鑰池清單 */}
                <div className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                        <label className="text-sm font-bold text-gray-700">
                            已儲存的金鑰池 ({keyPool.length})
                        </label>

                    </div>
                    <div className="max-h-40 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                        {keyPool.length === 0 ? (
                            <div className="text-center py-8 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 text-gray-400 text-sm">
                                尚未加入任何金鑰
                            </div>
                        ) : (
                            keyPool.map((key, idx) => (
                                <div key={idx} className="flex items-center gap-3 bg-white border border-gray-100 p-3 rounded-xl shadow-sm group animate-fade-in">
                                    <span className="flex-none w-6 h-6 bg-sky-100 text-sky-600 rounded-lg flex items-center justify-center text-xs font-bold">
                                        {idx + 1}
                                    </span>
                                    <span className="flex-1 font-mono text-xs text-gray-600 truncate">
                                        {showKeys ? key : `${key.slice(0, 10)}****************${key.slice(-4)}`}
                                    </span>
                                    <button
                                        onClick={() => handleRemoveKey(key)}
                                        className="text-gray-300 hover:text-red-500 transition-colors p-1"
                                    >
                                        🗑️
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                    {error && (
                        <div className="mt-3 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg border border-red-100 flex items-center gap-2">
                            <span>⚠️</span> {error}
                        </div>
                    )}
                </div>

                {/* 按鈕區 */}
                <div className="flex gap-4">
                    <button
                        onClick={handleSave}
                        disabled={isValidating || keyPool.length === 0}
                        className={`flex-1 py-4 rounded-2xl font-bold text-lg shadow-xl transition-all ${isValidating || keyPool.length === 0
                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            : 'bg-gradient-to-r from-sky-500 to-indigo-600 text-white hover:brightness-110 active:scale-95'
                            }`}
                    >
                        {isValidating ? (
                            <span className="flex items-center justify-center gap-3">
                                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                正在驗證金鑰...
                            </span>
                        ) : (
                            `🚀 儲存並開始輪詢 (${keyPool.length} 組)`
                        )}
                    </button>
                    {onClose && (
                        <button
                            onClick={onClose}
                            disabled={isValidating}
                            className="px-8 py-4 rounded-2xl font-bold text-gray-500 hover:bg-gray-100 transition-colors"
                        >
                            取消
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

