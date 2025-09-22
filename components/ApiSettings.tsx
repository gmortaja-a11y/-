import React, { useState } from 'react';
import { ApiConfigs, ApiStatuses, ConnectionStatus, ApiName } from '../types';

interface ApiSettingsProps {
    initialConfigs: ApiConfigs;
    initialStatuses: ApiStatuses;
    onSave: (configs: ApiConfigs) => void;
    onConfigsChange: (configs: ApiConfigs) => void;
    addNotification: (message: string, type: 'success' | 'error' | 'warning' | 'info') => void;
}

const Spinner: React.FC = () => (
    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-yellow-400"></div>
);

const StatusIndicator: React.FC<{ status: ConnectionStatus }> = ({ status }) => {
    const config = {
        connected: { text: 'متصل', color: 'bg-green-500', icon: '✔' },
        disconnected: { text: 'غير متصل', color: 'bg-red-500', icon: '✖' },
        pending: { text: 'جاري الاختبار...', color: 'bg-yellow-500', icon: <Spinner /> },
    };
    const current = config[status];
    return (
        <div className="flex items-center gap-2">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs ${current.color}`}>
                {current.icon}
            </div>
            <span className={`font-semibold text-sm ${status === 'pending' ? 'animate-pulse' : ''}`}>{current.text}</span>
        </div>
    );
};

const ApiSettings: React.FC<ApiSettingsProps> = ({ initialConfigs, initialStatuses, onSave, onConfigsChange, addNotification }) => {
    const [isSaving, setIsSaving] = useState(false);
    const [isLocked, setIsLocked] = useState({ 
        claude: !!initialConfigs.claudeApiKey && initialStatuses.claude === 'connected', 
        chatGpt: !!initialConfigs.chatGptApiKey && initialStatuses.chatGpt === 'connected' 
    });

    const handleSave = async () => {
        setIsSaving(true);
        await onSave(initialConfigs);
        // After save, lock fields that are successfully connected
        setIsLocked({
            claude: initialStatuses.claude === 'connected',
            chatGpt: initialStatuses.chatGpt === 'connected',
        });
        setIsSaving(false);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, apiName: ApiName) => {
        const newConfigs = { ...initialConfigs, [`${apiName}ApiKey`]: e.target.value };
        onConfigsChange(newConfigs);
    };

    const toggleLock = (apiName: ApiName) => {
        // Prevent locking if key is empty or not connected
        if(!initialConfigs[`${apiName}ApiKey`] || initialStatuses[apiName] !== 'connected') {
             setIsLocked(prev => ({ ...prev, [apiName]: false }));
             if(isLocked[apiName]) {
                 addNotification('لا يمكن القفل إلا بعد اتصال ناجح.', 'warning');
             }
             return;
        }
        setIsLocked(prev => ({ ...prev, [apiName]: !prev[apiName] }));
    };

    return (
        <div className="bg-card-bg-light dark:bg-card-bg-dark p-6 rounded-lg shadow-md border border-border-light dark:border-border-dark">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-3 text-text-primary-light dark:text-text-primary-dark">
                <span>🔧</span>
                إعدادات واجهات برمجة التطبيقات (API)
            </h2>
            <div className="space-y-6">
                 <div className="bg-bg-secondary-light dark:bg-bg-secondary-dark p-4 rounded-lg flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <h3 className="font-bold text-lg text-text-primary-light dark:text-text-primary-dark">Gemini API</h3>
                         <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                        </span>
                        <span className="text-green-500 font-semibold">متصل</span>
                    </div>
                    <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                        يتم الحصول على مفتاح API من متغيرات البيئة.
                    </p>
                </div>
                
                {/* Claude API Card */}
                <div className="bg-bg-secondary-light dark:bg-bg-secondary-dark p-4 rounded-lg">
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="font-bold text-lg text-text-primary-light dark:text-text-primary-dark">Claude API</h3>
                        <StatusIndicator status={initialStatuses.claude} />
                    </div>
                    <div className="flex items-center gap-2">
                        <input 
                            type="password"
                            placeholder="أدخل مفتاح Claude API"
                            value={initialConfigs.claudeApiKey}
                            readOnly={isLocked.claude}
                            onChange={(e) => handleInputChange(e, 'claude')}
                            className={`w-full p-2 border rounded-md bg-card-bg-light dark:bg-card-bg-dark border-border-light dark:border-border-dark focus:ring-primary focus:border-primary text-left transition-colors ${isLocked.claude ? 'bg-gray-100 dark:bg-gray-800 cursor-not-allowed' : ''}`}
                            dir="ltr"
                        />
                         <button onClick={() => toggleLock('claude')} title={isLocked.claude ? 'تعديل المفتاح' : 'قفل المفتاح'} className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition">
                            {isLocked.claude ? '✏️' : '🔓'}
                        </button>
                    </div>
                </div>

                {/* ChatGPT API Card */}
                <div className="bg-bg-secondary-light dark:bg-bg-secondary-dark p-4 rounded-lg">
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="font-bold text-lg text-text-primary-light dark:text-text-primary-dark">ChatGPT API</h3>
                        <StatusIndicator status={initialStatuses.chatGpt} />
                    </div>
                    <div className="flex items-center gap-2">
                        <input 
                            type="password"
                            placeholder="أدخل مفتاح ChatGPT API"
                            value={initialConfigs.chatGptApiKey}
                            readOnly={isLocked.chatGpt}
                            onChange={(e) => handleInputChange(e, 'chatGpt')}
                            className={`w-full p-2 border rounded-md bg-card-bg-light dark:bg-card-bg-dark border-border-light dark:border-border-dark focus:ring-primary focus:border-primary text-left transition-colors ${isLocked.chatGpt ? 'bg-gray-100 dark:bg-gray-800 cursor-not-allowed' : ''}`}
                            dir="ltr"
                        />
                         <button onClick={() => toggleLock('chatGpt')} title={isLocked.chatGpt ? 'تعديل المفتاح' : 'قفل المفتاح'} className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition">
                            {isLocked.chatGpt ? '✏️' : '🔓'}
                        </button>
                    </div>
                </div>
            </div>

            <div className="mt-6 flex justify-end">
                <button 
                    onClick={handleSave} 
                    disabled={isSaving}
                    className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold py-3 px-6 rounded-lg shadow-md hover:-translate-y-0.5 transform transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isSaving || initialStatuses.claude === 'pending' || initialStatuses.chatGpt === 'pending' ? <Spinner /> : '💾'}
                    <span>حفظ واختبار الاتصالات</span>
                </button>
            </div>
        </div>
    );
};

export default ApiSettings;
