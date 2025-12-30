/**
 * API Key 管理工具
 * 負責 localStorage 的讀寫操作
 */

const API_KEY_STORAGE_KEY = 'happy_kids_gemini_api_key';

/**
 * 從 localStorage 讀取 API Key
 */
export const getStoredApiKey = (): string | null => {
    try {
        const key = localStorage.getItem(API_KEY_STORAGE_KEY);
        return key;
    } catch (error) {
        console.error('讀取 API Key 失敗:', error);
        return null;
    }
};

/**
 * 儲存 API Key 到 localStorage
 */
export const saveApiKey = (apiKey: string): boolean => {
    try {
        localStorage.setItem(API_KEY_STORAGE_KEY, apiKey);
        return true;
    } catch (error) {
        console.error('儲存 API Key 失敗:', error);
        return false;
    }
};

/**
 * 清除 localStorage 中的 API Key
 */
export const clearApiKey = (): boolean => {
    try {
        localStorage.removeItem(API_KEY_STORAGE_KEY);
        return true;
    } catch (error) {
        console.error('清除 API Key 失敗:', error);
        return false;
    }
};

/**
 * 檢查是否有儲存的 API Key
 */
export const hasApiKey = (): boolean => {
    return !!getStoredApiKey();
};

/**
 * 驗證 API Key 格式（基本檢查）
 */
export const validateApiKeyFormat = (apiKey: string): { valid: boolean; error?: string } => {
    if (!apiKey || !apiKey.trim()) {
        return { valid: false, error: 'API Key 不能為空' };
    }

    if (apiKey.length < 20) {
        return { valid: false, error: 'API Key 長度不正確' };
    }

    // Google API Key 通常以 AIza 開頭
    if (!apiKey.startsWith('AIza')) {
        return { valid: false, error: 'API Key 格式可能不正確（應以 AIza 開頭）' };
    }

    return { valid: true };
};
