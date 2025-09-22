import React, { useState } from 'react';
import { Style } from '../types';
import Modal from './Modal';

interface StatCardProps {
  title: string;
  value: string;
  gradient: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, gradient }) => (
  <div className="bg-card-bg-light dark:bg-card-bg-dark p-6 rounded-xl border border-border-light dark:border-border-dark shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
     <div className={`absolute top-0 right-0 w-24 h-24 ${gradient} opacity-10 rounded-full -translate-y-1/3 translate-x-1/3`}></div>
    <div className="text-sm text-text-secondary-light dark:text-text-secondary-dark mb-2">{title}</div>
    <div className={`text-4xl font-bold bg-clip-text text-transparent ${gradient}`}>{value}</div>
  </div>
);

interface StyleCardProps {
  style: Style;
  onSelect: (name: string) => void;
}

const StyleCard: React.FC<StyleCardProps> = ({ style, onSelect }) => (
  <div onClick={() => onSelect(style.name)} className="bg-bg-secondary-light dark:bg-bg-secondary-dark p-4 rounded-lg cursor-pointer text-center border-2 border-transparent hover:border-secondary transition-all duration-300 transform hover:scale-105 shadow-sm hover:shadow-xl">
    <div className="text-5xl mb-2">{style.icon}</div>
    <div className="font-bold text-text-primary-light dark:text-text-primary-dark">{style.name}</div>
    <div className="text-xs text-text-secondary-light dark:text-text-secondary-dark">{style.scriptCount} نص</div>
  </div>
);

interface DashboardProps {
    styles: Style[];
    onAddStyle: (newStyle: Omit<Style, 'id' | 'scriptCount' | 'trainingData'>) => void;
    onSelectStyle: (styleName: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ styles, onAddStyle, onSelectStyle }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newStyleName, setNewStyleName] = useState('');
    const [newStyleIcon, setNewStyleIcon] = useState('🎨');

    const handleAddStyle = () => {
        if(newStyleName.trim()){
            onAddStyle({name: newStyleName, icon: newStyleIcon});
            setIsModalOpen(false);
            setNewStyleName('');
            setNewStyleIcon('🎨');
        }
    };

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="النصوص المنتجة" value="247" gradient="bg-gradient-to-r from-blue-500 to-indigo-600" />
        <StatCard title="الأساليب المتاحة" value={styles.length.toString()} gradient="bg-gradient-to-r from-green-400 to-teal-500" />
        <StatCard title="دقة الحقائق" value="94%" gradient="bg-gradient-to-r from-yellow-400 to-orange-500" />
        <StatCard title="المصادر المستخدمة" value="1,832" gradient="bg-gradient-to-r from-pink-500 to-purple-600" />
      </div>

      <div className="bg-card-bg-light dark:bg-card-bg-dark p-6 rounded-lg shadow-md border border-border-light dark:border-border-dark">
        <div className="flex justify-between items-center mb-6 pb-4 border-b-2 border-border-light dark:border-border-dark">
          <h2 className="text-2xl font-bold flex items-center gap-3 text-text-primary-light dark:text-text-primary-dark">
            <span>🎨</span>
            الأساليب المتاحة
          </h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {styles.map((style) => (
            <StyleCard key={style.id} style={style} onSelect={onSelectStyle} />
          ))}
          <div onClick={() => setIsModalOpen(true)} className="bg-gradient-to-br from-[#667eea] to-[#764ba2] text-white rounded-lg flex items-center justify-center text-6xl font-light cursor-pointer min-h-[120px] transition-all duration-300 transform hover:scale-110 hover:shadow-2xl">
            +
          </div>
        </div>
      </div>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="إضافة أسلوب جديد">
          <div className="space-y-4">
              <div>
                  <label className="block text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark mb-1">اسم الأسلوب</label>
                  <input type="text" value={newStyleName} onChange={(e) => setNewStyleName(e.target.value)} className="w-full p-2 border rounded-md bg-bg-secondary-light dark:bg-bg-secondary-dark border-border-light dark:border-border-dark focus:ring-primary focus:border-primary" />
              </div>
              <div>
                  <label className="block text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark mb-1">الأيقونة (Emoji)</label>
                  <input type="text" value={newStyleIcon} onChange={(e) => setNewStyleIcon(e.target.value)} className="w-full p-2 border rounded-md bg-bg-secondary-light dark:bg-bg-secondary-dark border-border-light dark:border-border-dark focus:ring-primary focus:border-primary" />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                  <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-md bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 transition">إلغاء</button>
                  <button onClick={handleAddStyle} className="px-4 py-2 rounded-md bg-primary text-white hover:opacity-90 transition">إضافة</button>
              </div>
          </div>
      </Modal>
    </>
  );
};

export default Dashboard;