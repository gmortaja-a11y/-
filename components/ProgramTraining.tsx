import React, { useState, useEffect } from 'react';
import { Style, TrainingData, TrainingMethod, TrainingExample } from '../types';

interface StyleTrainingProps {
  styles: Style[];
  onUpdateStyle: (styleId: string, trainingData: TrainingData) => void;
}

const TABS: { id: TrainingMethod; name: string }[] = [
    { id: 'instructions', name: 'الإرشادات المباشرة' },
    { id: 'example', name: 'التدريب بالأمثلة' },
    { id: 'bulk', name: 'التدريب بمجموعة نصوص' },
];

const StyleTraining: React.FC<StyleTrainingProps> = ({ styles, onUpdateStyle }) => {
  const [selectedStyleId, setSelectedStyleId] = useState<string>(styles[0]?.id || '');
  const [trainingData, setTrainingData] = useState<TrainingData>(styles[0]?.trainingData);
  const [activeTab, setActiveTab] = useState<TrainingMethod>('instructions');
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);

  useEffect(() => {
    const selectedStyle = styles.find(p => p.id === selectedStyleId);
    if (selectedStyle) {
      setTrainingData(selectedStyle.trainingData);
      setActiveTab(selectedStyle.trainingData.method);
    }
  }, [selectedStyleId, styles]);

  const handleDataChange = (field: keyof Omit<TrainingData, 'examples'>, value: string) => {
      setTrainingData(prev => ({...prev, [field]: value }));
  };
  
  const handleTabChange = (tabId: TrainingMethod) => {
    setActiveTab(tabId);
    setTrainingData(prev => ({...prev, method: tabId }));
  }

  const handleSave = () => {
    onUpdateStyle(selectedStyleId, trainingData);
    setShowSaveSuccess(true);
    setTimeout(() => setShowSaveSuccess(false), 2000);
  };

  const handleExampleChange = (id: number, field: 'before' | 'after', value: string) => {
    setTrainingData(prev => ({
        ...prev,
        examples: prev.examples.map(ex => ex.id === id ? { ...ex, [field]: value } : ex)
    }));
  };

  const handleAddExample = () => {
      setTrainingData(prev => ({
          ...prev,
          examples: [...(prev.examples || []), { id: Date.now(), before: '', after: '' }]
      }));
  };

  const handleDeleteExample = (id: number) => {
      setTrainingData(prev => ({
          ...prev,
          examples: prev.examples.filter(ex => ex.id !== id)
      }));
  };


  const renderActiveTabContent = () => {
    switch (activeTab) {
      case 'instructions':
        return (
          <div>
            <label className="block text-sm font-bold text-text-secondary-light dark:text-text-secondary-dark mb-2">
              إرشادات وأسلوب الكتابة
            </label>
            <textarea
              value={trainingData.instructions}
              onChange={(e) => handleDataChange('instructions', e.target.value)}
              placeholder={`مثال: استخدم نبرة غامضة وجادة. ركز على الجانب النفسي ودوافع الشخصيات. تجنب التفاصيل الدموية المبالغ فيها.`}
              className="w-full h-48 p-3 border rounded-lg bg-bg-secondary-light dark:bg-bg-secondary-dark border-border-light dark:border-border-dark focus:ring-primary focus:border-primary font-sans"
            />
          </div>
        );
      case 'example':
        return (
            <div className="space-y-6">
                {(trainingData.examples || []).map((example, index) => (
                    <div key={example.id} className="bg-card-bg-light dark:bg-card-bg-dark p-4 rounded-lg border border-border-light dark:border-border-dark relative">
                       <div className="flex justify-between items-center mb-2">
                         <h4 className="font-bold text-text-primary-light dark:text-text-primary-dark">المثال {index + 1}</h4>
                         <button onClick={() => handleDeleteExample(example.id)} className="text-red-500 hover:text-red-700 font-bold text-lg">&times;</button>
                       </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-text-secondary-light dark:text-text-secondary-dark mb-2">النص الأصلي (مثال: نص خبري)</label>
                                <textarea
                                    value={example.before}
                                    onChange={(e) => handleExampleChange(example.id, 'before', e.target.value)}
                                    placeholder="ضع هنا النص الأصلي أو مثالاً على الأسلوب الذي لا تريده."
                                    className="w-full h-48 p-3 border rounded-lg bg-bg-secondary-light dark:bg-bg-secondary-dark border-border-light dark:border-border-dark focus:ring-primary focus:border-primary font-sans"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-text-secondary-light dark:text-text-secondary-dark mb-2">النص المحرر (بأسلوبك)</label>
                                <textarea
                                    value={example.after}
                                    onChange={(e) => handleExampleChange(example.id, 'after', e.target.value)}
                                    placeholder="ضع هنا النص بعد تحريره بأسلوبك المطلوب."
                                    className="w-full h-48 p-3 border rounded-lg bg-bg-secondary-light dark:bg-bg-secondary-dark border-border-light dark:border-border-dark focus:ring-primary focus:border-primary font-sans"
                                />
                            </div>
                        </div>
                    </div>
                ))}
                 <button onClick={handleAddExample} className="w-full py-2 px-4 border-2 border-dashed rounded-lg border-primary text-primary hover:bg-primary hover:text-white transition duration-300">
                    + إضافة مثال جديد
                </button>
            </div>
        );
      case 'bulk':
        return (
            <div>
                <label className="block text-sm font-bold text-text-secondary-light dark:text-text-secondary-dark mb-2">
                    مجموعة نصوص للتدريب
                </label>
                <textarea
                    value={trainingData.instructions} // Re-using instructions field for bulk text
                    onChange={(e) => handleDataChange('instructions', e.target.value)}
                    placeholder="الصق هنا مجموعة كبيرة من النصوص المكتوبة بالأسلوب الذي تريد أن يتعلمه النموذج."
                    className="w-full h-64 p-3 border rounded-lg bg-bg-secondary-light dark:bg-bg-secondary-dark border-border-light dark:border-border-dark focus:ring-primary focus:border-primary font-sans"
                />
            </div>
        );
      default:
        return null;
    }
  };


  return (
    <div className="bg-card-bg-light dark:bg-card-bg-dark p-6 rounded-lg shadow-md border border-border-light dark:border-border-dark">
      <h2 className="text-2xl font-bold mb-2 text-text-primary-light dark:text-text-primary-dark flex items-center gap-3">
        <span>🧠</span>
        تدريب النماذج (إدارة الأساليب)
      </h2>
      <p className="mb-6 text-text-secondary-light dark:text-text-secondary-dark">
        اختر أسلوبًا وحدد طريقة التدريب المفضلة لديك. سيقوم النموذج باتباع هذه الإرشادات عند توليد نصوص جديدة.
      </p>

      <div className="mb-6">
        <label className="block text-sm font-bold text-text-secondary-light dark:text-text-secondary-dark mb-2">
          اختر الأسلوب للتعديل
        </label>
        <select
          value={selectedStyleId}
          onChange={(e) => setSelectedStyleId(e.target.value)}
          className="w-full p-3 border rounded-lg bg-bg-secondary-light dark:bg-bg-secondary-dark border-border-light dark:border-border-dark focus:ring-primary focus:border-primary"
        >
          {styles.map(s => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </div>

      <div className="border-b border-border-light dark:border-border-dark mb-4 flex space-x-1" role="tablist">
        {TABS.map(tab => (
            <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`px-4 py-2 text-sm font-semibold rounded-t-md transition-colors duration-200 focus:outline-none ${activeTab === tab.id ? 'bg-primary text-white' : 'text-text-secondary-light dark:text-text-secondary-dark hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                role="tab"
                aria-selected={activeTab === tab.id}
            >
                {tab.name}
            </button>
        ))}
      </div>
      
      <div className="p-4 bg-bg-secondary-light dark:bg-bg-secondary-dark rounded-b-md rounded-tr-md min-h-[300px]">
        {renderActiveTabContent()}
      </div>

      <div className="mt-6 flex justify-end items-center gap-4">
        {showSaveSuccess && (
            <span className="text-green-500 transition-opacity duration-300">
                ✅ تم الحفظ بنجاح!
            </span>
        )}
        <button
          onClick={handleSave}
          disabled={!selectedStyleId}
          className="flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold py-3 px-6 rounded-lg shadow-md hover:-translate-y-0.5 transform transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span>💾</span>
          <span>حفظ الإعدادات</span>
        </button>
      </div>
    </div>
  );
};

export default StyleTraining;