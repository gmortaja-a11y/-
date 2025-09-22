import React, { useState, useRef, ChangeEvent } from 'react';
import Modal from './Modal';
import { NotificationMessage } from '../types';

interface Asset {
  id: string;
  type: 'image' | 'video';
  url: string;
  name: string;
}

interface AssetGenerationModalProps {
  isOpen: boolean;
  onClose: () => void;
  scriptText: string;
  addNotification: (message: string, type: NotificationMessage['type']) => void;
}

const Spinner: React.FC<{ className?: string }> = ({ className }) => (
    <div className={`animate-spin rounded-full border-b-2 ${className || 'h-5 w-5 border-gray-500'}`}></div>
);

const AssetGenerationModal: React.FC<AssetGenerationModalProps> = ({ isOpen, onClose, scriptText, addNotification }) => {
  const [activeTab, setActiveTab] = useState<'images' | 'audio' | 'export'>('images');
  
  // Image Tab State
  const [imagePrompt, setImagePrompt] = useState('');
  const [imageModel, setImageModel] = useState('dall-e-3');
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [assets, setAssets] = useState<Asset[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Audio Tab State
  const [audioVoice, setAudioVoice] = useState('eleven-labs-adam');
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const handleGenerateImage = async () => {
    if (!imagePrompt) {
        addNotification('الرجاء إدخال وصف للصورة.', 'warning');
        return;
    }
    setIsGeneratingImage(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    const newImage: Asset = {
        id: `gen-${Date.now()}`,
        type: 'image',
        url: `https://picsum.photos/seed/${Date.now()}/300/200`,
        name: `${imagePrompt.substring(0, 20)}.jpg`
    };
    setAssets(prev => [newImage, ...prev]);
    setIsGeneratingImage(false);
    addNotification('تم توليد الصورة بنجاح!', 'success');
  };
  
  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
        // FIX: Explicitly type `file` as `File` to resolve type inference issues.
        const newAssets: Asset[] = Array.from(event.target.files).map((file: File) => ({
            id: `local-${file.name}-${Date.now()}`,
            type: file.type.startsWith('video') ? 'video' : 'image',
            url: URL.createObjectURL(file),
            name: file.name
        }));
        setAssets(prev => [...newAssets, ...prev]);
    }
  };

  const handleGenerateAudio = async () => {
    setIsGeneratingAudio(true);
    setAudioUrl(null);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    // In a real app, you would get a URL from the API
    setAudioUrl('mock_audio_url.mp3'); 
    setIsGeneratingAudio(false);
    addNotification('تم توليد المقطع الصوتي بنجاح!', 'success');
  };
  
  const handleExport = () => {
    const projectData = {
        script: scriptText,
        assets: assets.map(a => ({ type: a.type, name: a.name })), // Don't include blob URLs
        audio: audioUrl
    };
    const blob = new Blob([JSON.stringify(projectData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'style_platform_project.json';
    a.click();
    URL.revokeObjectURL(url);
    addNotification('تم تصدير ملف المشروع بنجاح.', 'success');
  };

  const renderImageTab = () => (
    <div className="space-y-4">
        <div>
            <h4 className="font-bold text-text-primary-light dark:text-text-primary-dark mb-2">1. توليد الصور بالذكاء الاصطناعي</h4>
            <div className="flex flex-col sm:flex-row gap-2">
                <input type="text" value={imagePrompt} onChange={e => setImagePrompt(e.target.value)} placeholder="مثال: لقطة سينمائية لصحراء واسعة وقت الغروب..." className="flex-grow p-2 border rounded-md bg-bg-secondary-light dark:bg-bg-secondary-dark border-border-light dark:border-border-dark focus:ring-primary focus:border-primary" />
                <select value={imageModel} onChange={e => setImageModel(e.target.value)} className="p-2 border rounded-md bg-bg-secondary-light dark:bg-bg-secondary-dark border-border-light dark:border-border-dark focus:ring-primary focus:border-primary">
                    <option value="dall-e-3">DALL-E 3</option>
                    <option value="midjourney">Midjourney</option>
                    <option value="stable-diffusion">Stable Diffusion</option>
                </select>
                <button onClick={handleGenerateImage} disabled={isGeneratingImage} className="px-4 py-2 rounded-md bg-primary text-white hover:opacity-90 transition flex items-center justify-center gap-2">
                    {isGeneratingImage ? <Spinner className="border-white" /> : '🖼️'}
                    <span>توليد</span>
                </button>
            </div>
        </div>
        <div>
            <h4 className="font-bold text-text-primary-light dark:text-text-primary-dark mb-2">2. رفع الوسائط الخاصة</h4>
            <input type="file" multiple accept="image/*,video/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
            <button onClick={() => fileInputRef.current?.click()} className="w-full p-2 border-2 border-dashed rounded-md border-border-light dark:border-border-dark hover:bg-gray-100 dark:hover:bg-gray-700 transition">
                📂 انقر لرفع الصور والفيديوهات
            </button>
        </div>
        <div>
            <h4 className="font-bold text-text-primary-light dark:text-text-primary-dark mb-2">3. معرض المشروع</h4>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 bg-bg-secondary-light dark:bg-bg-secondary-dark p-2 rounded-lg min-h-[100px]">
                {assets.length === 0 && <p className="col-span-full text-center text-sm text-text-secondary-light dark:text-text-secondary-dark p-4">لم تتم إضافة وسائط بعد.</p>}
                {assets.map(asset => (
                    <div key={asset.id} className="relative aspect-video group">
                       {asset.type === 'image' ? (
                            <img src={asset.url} alt={asset.name} className="w-full h-full object-cover rounded-md"/>
                       ) : (
                            <video src={asset.url} className="w-full h-full object-cover rounded-md" />
                       )}
                       <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 flex items-end p-1 transition-opacity">
                           <p className="text-white text-xs truncate">{asset.name}</p>
                       </div>
                    </div>
                ))}
            </div>
        </div>
    </div>
  );

  const renderAudioTab = () => (
    <div className="space-y-4">
        <h4 className="font-bold text-text-primary-light dark:text-text-primary-dark mb-2">توليد التعليق الصوتي (تحويل النص إلى كلام)</h4>
        <div className="p-2 border rounded-md bg-bg-secondary-light dark:bg-bg-secondary-dark border-border-light dark:border-border-dark text-sm h-32 overflow-y-auto">
            <p className="whitespace-pre-wrap">{scriptText}</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
            <select value={audioVoice} onChange={e => setAudioVoice(e.target.value)} className="flex-grow p-2 border rounded-md bg-bg-secondary-light dark:bg-bg-secondary-dark border-border-light dark:border-border-dark focus:ring-primary focus:border-primary">
                <option value="eleven-labs-adam">ElevenLabs - Adam (Deep)</option>
                <option value="google-wavenet-ar-a">Google WaveNet - Arabic A</option>
                <option value="openai-tts-echo">OpenAI TTS - Echo</option>
            </select>
            <button onClick={handleGenerateAudio} disabled={isGeneratingAudio} className="px-4 py-2 rounded-md bg-primary text-white hover:opacity-90 transition flex items-center justify-center gap-2">
                {isGeneratingAudio ? <Spinner className="border-white" /> : '🔊'}
                <span>توليد الصوت</span>
            </button>
        </div>
        {audioUrl && (
            <div className="mt-4">
                <h5 className="font-semibold mb-2">الصوت النهائي:</h5>
                <audio controls src={audioUrl} className="w-full">
                    Your browser does not support the audio element.
                </audio>
                <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark mt-1">(ملاحظة: هذا ملف صوتي تجريبي. في التطبيق الفعلي، سيكون هذا رابطاً للملف الصوتي المولد)</p>
            </div>
        )}
    </div>
  );

  const renderExportTab = () => (
    <div className="text-center p-4">
        <h4 className="text-xl font-bold text-text-primary-light dark:text-text-primary-dark mb-2">تصدير المشروع</h4>
        <p className="text-text-secondary-light dark:text-text-secondary-dark mb-6">
            قم بتصدير جميع أصول المشروع (الوسائط، الصوت، النص) في ملف واحد جاهز للاستيراد في برامج المونتاج.
        </p>
        <button onClick={handleExport} className="px-8 py-3 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold hover:opacity-90 transition shadow-lg hover:shadow-xl transform hover:-translate-y-px flex items-center justify-center gap-3 mx-auto">
            <span>🎬</span>
            <span>تصدير لبرامج المونتاج</span>
        </button>
    </div>
  );

  const TABS = [
    { id: 'images', name: 'الصور والفيديو', icon: '🖼️' },
    { id: 'audio', name: 'الصوت', icon: '🔊' },
    { id: 'export', name: 'تصدير', icon: '🎬' },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="استوديو الوسائط والصوت">
        <div className="w-full">
            <div className="border-b border-border-light dark:border-border-dark flex">
                {TABS.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-t-md transition-colors duration-200 focus:outline-none ${activeTab === tab.id ? 'bg-primary text-white' : 'text-text-secondary-light dark:text-text-secondary-dark hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                    >
                        <span>{tab.icon}</span>
                        <span>{tab.name}</span>
                    </button>
                ))}
            </div>
            <div className="p-4 min-h-[300px]">
                {activeTab === 'images' && renderImageTab()}
                {activeTab === 'audio' && renderAudioTab()}
                {activeTab === 'export' && renderExportTab()}
            </div>
        </div>
    </Modal>
  );
};

export default AssetGenerationModal;