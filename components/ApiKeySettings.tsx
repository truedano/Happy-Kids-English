import React, { useState } from 'react';

interface ApiKeySettingsProps {
    currentApiKey: string | null;
    onUpdate: (apiKey: string) => void;
    onClear: () => void;
}

export const ApiKeySettings: React.FC<ApiKeySettingsProps> = ({
    currentApiKey,
    onUpdate,
    onClear
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [showKey, setShowKey] = useState(false);
    const [newApiKey, setNewApiKey] = useState('');
    const [isEditing, setIsEditing] = useState(false);

    const maskedKey = currentApiKey
        ? `${currentApiKey.slice(0, 8)}****${currentApiKey.slice(-4)}`
        : '未設定';

    const handleUpdate = () => {
        if (newApiKey.trim()) {
            onUpdate(newApiKey.trim());
            setNewApiKey('');
            setIsEditing(false);
            setShowKey(false);
        }
    };

    const handleClear = () => {
        if (confirm('確定要清除 API Key 嗎？清除後將無法使用 AI 功能。')) {
            onClear();
            setIsOpen(false);
        }
    };

    return (
        <>
            {/* 觸發按鈕 */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-gray-600 hover:text-gray-800 transition-colors"
                title="API 設定"
            >
                <span className="text-2xl">⚙️</span>
                {!currentApiKey && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
                )}
            </button>

            {/* 下拉選單 */}
            {isOpen && (
                <>
                    {/* 背景遮罩 */}
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                    ></div>

                    {/* 設定面板 */}
                    <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 p-6 z-50 animate-fade-in-up">
                        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <span>🔑</span>
                            <span>API Key 設定</span>
                        </h3>

                        {/* 當前狀態 */}
                        <div className="mb-4">
                            <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">
                                目前狀態
                            </label>
                            <div className={`px-3 py-2 rounded-lg border-2 ${currentApiKey
                                    ? 'bg-green-50 border-green-200'
                                    : 'bg-red-50 border-red-200'
                                }`}>
                                <div className="flex items-center justify-between">
                                    <span className={`text-sm font-mono ${currentApiKey ? 'text-green-700' : 'text-red-600'
                                        }`}>
                                        {currentApiKey ? (showKey ? currentApiKey : maskedKey) : '❌ 未設定'}
                                    </span>
                                    {currentApiKey && (
                                        <button
                                            onClick={() => setShowKey(!showKey)}
                                            className="text-gray-400 hover:text-gray-600 ml-2"
                                        >
                                            {showKey ? '🙈' : '👁️'}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* 編輯模式 */}
                        {isEditing ? (
                            <div className="mb-4">
                                <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">
                                    新的 API Key
                                </label>
                                <input
                                    type="text"
                                    value={newApiKey}
                                    onChange={(e) => setNewApiKey(e.target.value)}
                                    placeholder="貼上新的 API Key..."
                                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-sky-500 focus:outline-none font-mono text-sm"
                                    autoFocus
                                />
                                <div className="flex gap-2 mt-2">
                                    <button
                                        onClick={handleUpdate}
                                        disabled={!newApiKey.trim()}
                                        className="flex-1 bg-sky-500 text-white px-3 py-2 rounded-lg font-bold text-sm hover:bg-sky-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                                    >
                                        ✅ 儲存
                                    </button>
                                    <button
                                        onClick={() => {
                                            setIsEditing(false);
                                            setNewApiKey('');
                                        }}
                                        className="px-3 py-2 rounded-lg font-bold text-sm text-gray-600 hover:bg-gray-100 transition-colors"
                                    >
                                        取消
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="w-full bg-sky-500 text-white px-4 py-2.5 rounded-xl font-bold hover:bg-sky-600 transition-colors flex items-center justify-center gap-2"
                                >
                                    <span>✏️</span>
                                    <span>{currentApiKey ? '更新 API Key' : '設定 API Key'}</span>
                                </button>

                                {currentApiKey && (
                                    <button
                                        onClick={handleClear}
                                        className="w-full bg-red-50 text-red-600 px-4 py-2.5 rounded-xl font-bold hover:bg-red-100 transition-colors flex items-center justify-center gap-2 border border-red-200"
                                    >
                                        <span>🗑️</span>
                                        <span>清除 API Key</span>
                                    </button>
                                )}
                            </div>
                        )}

                        {/* 說明 */}
                        <div className="mt-4 pt-4 border-t border-gray-100">
                            <p className="text-xs text-gray-500 mb-2">
                                💡 <strong>提示：</strong>
                            </p>
                            <ul className="text-xs text-gray-500 space-y-1 ml-4">
                                <li>• API Key 儲存在本機瀏覽器</li>
                                <li>• 不會傳送到任何伺服器</li>
                                <li>• 清除瀏覽器資料會遺失設定</li>
                            </ul>
                            <a
                                href="https://aistudio.google.com/apikey"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block mt-3 text-xs text-sky-600 hover:text-sky-700 underline font-bold"
                            >
                                📖 前往 Google AI Studio 申請
                            </a>
                        </div>
                    </div>
                </>
            )}
        </>
    );
};
