import React, { useState, useEffect, useCallback } from 'react';
import { Theme, Section, Script, FactCheckResult, NotificationMessage, Style, TrainingData, ApiConfigs, ApiStatuses, ConnectionStatus, ApiName, TrainingExample } from './types';
import { NAV_ITEMS, STYLES } from './constants';
import { getApiConfigs, saveApiConfigs, testApiConnection } from './services/apiConfigService';
import Header from './components/Header';
import Navigation from './components/Navigation';
import Dashboard from './components/Dashboard';
import NewScriptForm from './components/NewScriptForm';
import Notification from './components/Notification';
import ApiSettings from './components/ApiSettings';
import StyleTraining from './components/ProgramTraining';

const STYLES_STORAGE_KEY = 'style_platform_data_v2'; // Incremented version for new structure

const App: React.FC = () => {
  const [theme, setTheme] = useState<Theme>('light');
  const [activeSection, setActiveSection] = useState<Section>('dashboard');
  const [generatedScript, setGeneratedScript] = useState<Script | null>(null);
  const [factCheckResult, setFactCheckResult] = useState<FactCheckResult | null>(null);
  const [notifications, setNotifications] = useState<NotificationMessage[]>([]);
  const [styles, setStyles] = useState<Style[]>(() => {
    try {
      const storedStyles = localStorage.getItem(STYLES_STORAGE_KEY);
      if (storedStyles) {
        const parsed = JSON.parse(storedStyles);
        if(Array.isArray(parsed) && parsed.length > 0 && parsed[0]?.trainingData?.method && Array.isArray(parsed[0]?.trainingData?.examples)) {
            return parsed;
        }
      }
      return STYLES;
    } catch (error) {
      console.error("Failed to load styles from localStorage", error);
      return STYLES;
    }
  });

  const [apiConfigs, setApiConfigs] = useState<ApiConfigs>({ claudeApiKey: '', chatGptApiKey: '' });
  const [apiStatuses, setApiStatuses] = useState<ApiStatuses>({ claude: 'disconnected', chatGpt: 'disconnected' });

  // Load API configs on mount
  useEffect(() => {
      const loadAndTestConfigs = async () => {
          const savedConfigs = await getApiConfigs();
          setApiConfigs(savedConfigs);
          if (savedConfigs.claudeApiKey) testAndSetConnection('claude', savedConfigs.claudeApiKey, false);
          if (savedConfigs.chatGptApiKey) testAndSetConnection('chatGpt', savedConfigs.chatGptApiKey, false);
      };
      loadAndTestConfigs();
  }, []);

  const testAndSetConnection = async (apiName: ApiName, apiKey: string, showNotification: boolean = false) => {
      if (!apiKey) {
          setApiStatuses(prev => ({ ...prev, [apiName]: 'disconnected' }));
          return false;
      }
      setApiStatuses(prev => ({ ...prev, [apiName]: 'pending' }));
      const isConnected = await testApiConnection(apiKey);
      setApiStatuses(prev => ({ ...prev, [apiName]: isConnected ? 'connected' : 'disconnected' }));

      if(showNotification){
          if(isConnected){
              addNotification(`تم الاتصال بـ ${apiName} API بنجاح`, 'success');
          } else {
              addNotification(`فشل الاتصال بـ ${apiName} API. يرجى التحقق من المفتاح.`, 'error');
          }
      }
      return isConnected;
  };

  const handleSaveApiSettings = async (configs: ApiConfigs) => {
    addNotification('جاري حفظ الإعدادات...', 'info');
    const success = await saveApiConfigs(configs);
    if (success) {
        addNotification('تم حفظ الإعدادات بنجاح. جاري اختبار الاتصالات...', 'success');
        await testAndSetConnection('claude', configs.claudeApiKey, true);
        await testAndSetConnection('chatGpt', configs.chatGptApiKey, true);
    } else {
        addNotification('فشل حفظ الإعدادات.', 'error');
    }
  };


  useEffect(() => {
    const root = window.document.documentElement;
    const body = window.document.body;
    
    root.classList.remove(theme === 'light' ? 'dark' : 'light');
    root.classList.add(theme);

    body.classList.remove(theme === 'light' ? 'bg-bg-primary-dark' : 'bg-bg-primary-light');
    body.classList.add(theme === 'light' ? 'bg-bg-primary-light' : 'bg-bg-primary-dark');

  }, [theme]);

  useEffect(() => {
    try {
        localStorage.setItem(STYLES_STORAGE_KEY, JSON.stringify(styles));
    } catch (error) {
        console.error("Failed to save styles to localStorage", error);
    }
  }, [styles]);

  const addNotification = useCallback((message: string, type: NotificationMessage['type']) => {
    const newNotification = {
      id: Date.now(),
      message,
      type,
    };
    setNotifications(prev => [...prev, newNotification]);
  }, []);

  const handleSectionChange = (section: Section) => {
    if (section === 'factCheck' && !generatedScript) {
        addNotification('الرجاء توليد نص أولاً لتدقيق الحقائق', 'warning');
        return;
    }
    setActiveSection(section);
  };

  const handleScriptGenerated = (script: Script) => {
    setGeneratedScript(script);
    setActiveSection('newScript');
  };
  
  const handleFactCheckComplete = (result: FactCheckResult) => {
      setFactCheckResult(result);
      setActiveSection('factCheck');
  };

  const handleAddStyle = (newStyle: Omit<Style, 'id' | 'scriptCount' | 'trainingData'>) => {
    const styleToAdd: Style = {
      ...newStyle,
      id: newStyle.name.toLowerCase().replace(/\s+/g, '-'),
      scriptCount: 0,
      // FIX: Added missing policyUrl and policyText properties to the trainingData object to match the TrainingData type.
      trainingData: {
        method: 'instructions',
        instructions: '',
        examples: [],
        policyUrl: '',
        policyText: '',
      },
    };
    setStyles(prev => [...prev, styleToAdd]);
    addNotification(`تمت إضافة أسلوب "${newStyle.name}" بنجاح`, 'success');
  };

  const handleUpdateStyleTraining = (styleId: string, trainingData: TrainingData) => {
    setStyles(prev => prev.map(s => s.id === styleId ? { ...s, trainingData } : s));
    addNotification('تم حفظ إرشادات الأسلوب بنجاح', 'success');
  };

  const handleAddToTraining = (styleId: string, originalContent: string, editedContent: string) => {
    setStyles(prevStyles => {
        return prevStyles.map(style => {
            if (style.id === styleId) {
                const newExample: TrainingExample = {
                    id: Date.now(),
                    before: originalContent,
                    after: editedContent,
                };
                const updatedTrainingData = { ...style.trainingData };
                updatedTrainingData.examples = [...updatedTrainingData.examples, newExample];
                
                // If the user adds an example, switch the preferred method to 'example'
                updatedTrainingData.method = 'example';

                return { ...style, trainingData: updatedTrainingData };
            }
            return style;
        });
    });
    addNotification('تمت إضافة المثال بنجاح إلى بيانات التدريب!', 'success');
};


  const renderSection = () => {
    switch (activeSection) {
      case 'dashboard':
        return <Dashboard styles={styles} onAddStyle={handleAddStyle} onSelectStyle={(styleName: string) => setActiveSection('newScript')} />;
      case 'newScript':
        return <NewScriptForm styles={styles} addNotification={addNotification} onScriptGenerated={handleScriptGenerated} onFactCheckComplete={handleFactCheckComplete} initialScript={generatedScript} onAddToTraining={handleAddToTraining} apiStatuses={apiStatuses}/>;
      case 'factCheck':
        return factCheckResult ? (
          <div className="bg-card-bg-light dark:bg-card-bg-dark p-6 rounded-lg shadow-md border border-border-light dark:border-border-dark">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-3 text-text-primary-light dark:text-text-primary-dark">
              <span>✅</span>
              نتائج تدقيق الحقائق
            </h2>
            <div className="mb-6">
                <span className="text-text-secondary-light dark:text-text-secondary-dark">دقة المعلومات:</span>
                <div className="w-full bg-bg-secondary-light dark:bg-bg-secondary-dark rounded-full h-8 mt-2 overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-500 to-green-500 h-full rounded-full flex items-center justify-center text-white font-bold transition-all duration-1000" style={{ width: `${factCheckResult.accuracy}%` }}>
                        {factCheckResult.accuracy}%
                    </div>
                </div>
            </div>
            <div className="prose prose-sm max-w-none text-text-primary-light dark:text-text-primary-dark whitespace-pre-wrap">
              <h4 className="font-bold">التفاصيل:</h4>
              <p>{factCheckResult.details}</p>
            </div>
          </div>
        ) : <p className="text-center text-text-secondary-light dark:text-text-secondary-dark">لم يتم إجراء تدقيق للحقائق بعد.</p>;
      case 'training':
        return <StyleTraining styles={styles} onUpdateStyle={handleUpdateStyleTraining} />;
      case 'api':
        return <ApiSettings addNotification={addNotification} initialConfigs={apiConfigs} initialStatuses={apiStatuses} onSave={handleSaveApiSettings} onConfigsChange={setApiConfigs}/>;
      default:
        return <Dashboard styles={styles} onAddStyle={handleAddStyle} onSelectStyle={() => setActiveSection('newScript')} />;
    }
  };

  return (
    <div className={`min-h-screen bg-bg-primary-light dark:bg-bg-primary-dark text-text-primary-light dark:text-text-primary-dark font-sans transition-colors duration-300`}>
      <Header theme={theme} setTheme={setTheme} />
      <Navigation activeSection={activeSection} setActiveSection={handleSectionChange} />
      <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {renderSection()}
      </main>
      <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm">
        {notifications.map(notification => (
          <Notification
            key={notification.id}
            message={notification.message}
            type={notification.type}
            onDismiss={() => setNotifications(prev => prev.filter(n => n.id !== notification.id))}
          />
        ))}
      </div>
    </div>
  );
};

export default App;
