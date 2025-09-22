import React, { useState, useEffect } from 'react';
import { Script, FactCheckResult, NotificationMessage, Style, ApiStatuses } from '../types';
import { generateScript, generateIdeas, deepResearch, factCheckScript } from '../services/geminiService';
import { transformWithClaude } from '../services/claudeService';
import Modal from './Modal';
import AssetGenerationModal from './AssetGenerationModal';

interface NewScriptFormProps {
    styles: Style[];
    addNotification: (message: string, type: NotificationMessage['type']) => void;
    onScriptGenerated: (script: Script) => void;
    onFactCheckComplete: (result: FactCheckResult) => void;
    onAddToTraining: (styleId: string, originalContent: string, editedContent: string) => void;
    initialScript: Script | null;
    apiStatuses: ApiStatuses;
}

const Spinner: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={`animate-spin ${className || 'h-5 w-5 text-white'}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

const ActionButton: React.FC<{ onClick: () => void, text: string, icon: string, color: string, isLoading: boolean, disabled?: boolean }> = ({ onClick, text, icon, color, isLoading, disabled = false }) => (
    <button onClick={onClick} disabled={isLoading || disabled} className={`flex items-center justify-center gap-2 w-full sm:w-auto text-white font-bold py-3 px-6 rounded-lg shadow-md hover:-translate-y-0.5 transform transition duration-300 ${color} ${isLoading || disabled ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-xl'}`}>
        {isLoading ? <Spinner /> : <span>{icon}</span>}
        <span>{text}</span>
    </button>
);

const exportToWord = (content: string, title: string) => {
    const header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' "+
        "xmlns:w='urn:schemas-microsoft-com:office:word' "+
        "xmlns='http://www.w3.org/TR/REC-html40'>"+
        "<head><meta charset='utf-8'><title>Export HTML to Word Document with JavaScript</title></head><body>";
    const footer = "</body></html>";
    const sourceHTML = header + content.replace(/\n/g, '<br/>') + footer;
    
    const source = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(sourceHTML);
    const fileDownload = document.createElement("a");
    document.body.appendChild(fileDownload);
    fileDownload.href = source;
    fileDownload.download = `${title}.doc`;
    fileDownload.click();
    document.body.removeChild(fileDownload);
};


const NewScriptForm: React.FC<NewScriptFormProps> = ({ styles, addNotification, onScriptGenerated, onFactCheckComplete, initialScript, onAddToTraining, apiStatuses }) => {
    const [selectedStyleId, setSelectedStyleId] = useState(styles[0]?.id || '');
    const [title, setTitle] = useState('');
    const [duration, setDuration] = useState('22');
    const [language, setLanguage] = useState('ar');
    const [sourceText, setSourceText] = useState('');
    const [script, setScript] = useState<Script | null>(initialScript);
    const [editedContent, setEditedContent] = useState('');
    const [loadingStates, setLoadingStates] = useState({ generate: false, ideas: false, research: false, factCheck: false });
    const [isIdeasModalOpen, setIsIdeasModalOpen] = useState(false);
    const [ideasModalContent, setIdeasModalContent] = useState({ title: '', content: '' });
    const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);


    const selectedStyle = styles.find(s => s.id === selectedStyleId);
    const isStyleTrained = selectedStyle ? 
        (selectedStyle.trainingData.instructions && selectedStyle.trainingData.instructions.trim() !== '') || 
        (selectedStyle.trainingData.examples && selectedStyle.trainingData.examples.some(ex => ex.before.trim() !== '' && ex.after.trim() !== '')) :
        false;

    const canUseClaude = apiStatuses.claude === 'connected' && isStyleTrained && sourceText.trim() !== '';

    useEffect(() => {
        if(initialScript){
            setScript(initialScript);
            setEditedContent(initialScript.content);
        }
    }, [initialScript]);

    const handleApiCall = async (task: () => Promise<Script>) => {
        setLoadingStates(prev => ({ ...prev, generate: true }));
        try {
            const generatedScript = await task();
            setScript(generatedScript);
            setEditedContent(generatedScript.content);
            onScriptGenerated(generatedScript);
            addNotification('تمت المهمة بنجاح!', 'success');
        } catch (error) {
            addNotification(error instanceof Error ? error.message : 'حدث خطأ غير متوقع', 'error');
        } finally {
            setLoadingStates(prev => ({ ...prev, generate: false }));
        }
    };

    const handleTransformScript = () => {
        if (!selectedStyleId || !title || !sourceText) {
            addNotification('الرجاء اختيار أسلوب، إدخال عنوان، وتوفير نص مصدري للتحويل.', 'error');
            return;
        }
        handleApiCall(async () => {
            if (canUseClaude) {
                addNotification('يتم التحويل باستخدام محرك Claude السريع...', 'info');
                return transformWithClaude(selectedStyle?.name || '', title, duration, language, sourceText, selectedStyle?.trainingData);
            } else {
                addNotification('يتم التحويل باستخدام محرك Gemini...', 'info');
                return generateScript(selectedStyle?.name || '', title, duration, language, sourceText, selectedStyle?.trainingData);
            }
        });
    };

    const handleGenerateFromTitle = () => {
        if (!selectedStyleId || !title) {
            addNotification('الرجاء اختيار أسلوب وإدخال عنوان الحلقة', 'error');
            return;
        }
        handleApiCall(async () => {
            addNotification('يتم التوليد من العنوان باستخدام Gemini...', 'info');
            return generateScript(selectedStyle?.name || '', title, duration, language, '', selectedStyle?.trainingData);
        });
    };

    const handleAddToTrainingClick = () => {
        if (script && editedContent.trim() !== script.content.trim()) {
            onAddToTraining(selectedStyleId, script.content, editedContent);
        } else {
            addNotification('لا يوجد تغييرات لإضافتها للتدريب.', 'warning');
        }
    };
    
    const handleGenerateIdeas = async () => {
        if(!selectedStyleId) {
            addNotification('الرجاء اختيار أسلوب أولاً', 'warning');
            return;
        }
        setLoadingStates(prev => ({ ...prev, ideas: true }));
        try {
            const selectedStyleForIdeas = styles.find(p => p.id === selectedStyleId);
            const ideas = await generateIdeas(selectedStyleForIdeas?.name || '');
            setIdeasModalContent({ title: 'أفكار للحلقات', content: ideas.join('\n') });
            setIsIdeasModalOpen(true);
        } catch (error) {
            addNotification('فشل في توليد الأفكار', 'error');
        } finally {
            setLoadingStates(prev => ({ ...prev, ideas: false }));
        }
    };
    
    const handleDeepResearch = async () => {
        if(!title) {
            addNotification('الرجاء إدخال عنوان أو موضوع للبحث', 'warning');
            return;
        }
        setLoadingStates(prev => ({ ...prev, research: true }));
        try {
            const { research, sources } = await deepResearch(title);
            const sourcesText = sources.map(s => `[${s.name}](${s.url})`).join('\n');
            setIdeasModalContent({ title: 'نتائج البحث المعمق', content: `${research}\n\n**المصادر:**\n${sourcesText}` });
            setIsIdeasModalOpen(true);
        } catch (error) {
            addNotification('فشل البحث المعمق', 'error');
        } finally {
            setLoadingStates(prev => ({ ...prev, research: false }));
        }
    };

    const handleFactCheck = async () => {
        const contentToCheck = editedContent || script?.content;
        if (!contentToCheck) {
            addNotification('لا يوجد نص لتدقيق الحقائق. الرجاء توليد نص أولاً.', 'warning');
            return;
        }
        setLoadingStates(prev => ({ ...prev, factCheck: true }));
        try {
            const result = await factCheckScript(contentToCheck);
            onFactCheckComplete(result);
            addNotification('تم إكمال تدقيق الحقائق بنجاح', 'success');
        } catch (error) {
            addNotification('فشل تدقيق الحقائق', 'error');
        } finally {
            setLoadingStates(prev => ({ ...prev, factCheck: false }));
        }
    };

    return (
        <div className="space-y-8">
            <div className="bg-card-bg-light dark:bg-card-bg-dark p-6 rounded-lg shadow-md border border-border-light dark:border-border-dark">
                <h2 className="text-2xl font-bold mb-6 text-text-primary-light dark:text-text-primary-dark flex items-center gap-3">
                    <span>✍️</span>
                    إنشاء نص جديد
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-bold text-text-secondary-light dark:text-text-secondary-dark mb-2">اختر الأسلوب</label>
                        <select value={selectedStyleId} onChange={e => setSelectedStyleId(e.target.value)} className="w-full p-3 border rounded-lg bg-bg-secondary-light dark:bg-bg-secondary-dark border-border-light dark:border-border-dark focus:ring-primary focus:border-primary">
                            {styles.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-text-secondary-light dark:text-text-secondary-dark mb-2">عنوان الحلقة</label>
                        <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="أدخل عنوان الحلقة..." className="w-full p-3 border rounded-lg bg-bg-secondary-light dark:bg-bg-secondary-dark border-border-light dark:border-border-dark focus:ring-primary focus:border-primary" />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-text-secondary-light dark:text-text-secondary-dark mb-2">مدة الحلقة (دقيقة)</label>
                        <input type="number" min="1" value={duration} onChange={e => setDuration(e.target.value)} placeholder="مثال: 22" className="w-full p-3 border rounded-lg bg-bg-secondary-light dark:bg-bg-secondary-dark border-border-light dark:border-border-dark focus:ring-primary focus:border-primary" />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-text-secondary-light dark:text-text-secondary-dark mb-2">لغة النص</label>
                        <select value={language} onChange={e => setLanguage(e.target.value)} className="w-full p-3 border rounded-lg bg-bg-secondary-light dark:bg-bg-secondary-dark border-border-light dark:border-border-dark focus:ring-primary focus:border-primary">
                            <option value="العربية">العربية</option>
                            <option value="English">English</option>
                            <option value="Français">Français</option>
                        </select>
                    </div>
                </div>
                <div className="mt-6">
                    <label className="flex items-center justify-between text-sm font-bold text-text-secondary-light dark:text-text-secondary-dark mb-2">
                        <span>النص المصدري (لتحويل المحتوى)</span>
                        {isStyleTrained && sourceText.trim() !== '' && (
                            <span className={`px-2 py-1 text-xs rounded-full text-white ${canUseClaude ? 'bg-green-500' : 'bg-blue-500'}`}>
                                {`المحرك: ${canUseClaude ? 'Claude (سريع)' : 'Gemini (دقيق)'}`}
                            </span>
                        )}
                    </label>
                    {isStyleTrained ? (
                        <textarea
                            value={sourceText}
                            onChange={(e) => setSourceText(e.target.value)}
                            placeholder="ضع هنا النص الخام (مثل مقال إخباري) ليتم تحويله إلى سيناريو بأسلوب البرنامج المدرب..."
                            className="w-full h-40 p-3 border rounded-lg bg-bg-secondary-light dark:bg-bg-secondary-dark border-border-light dark:border-border-dark focus:ring-primary focus:border-primary font-sans"
                        ></textarea>
                    ) : (
                         <div className="w-full h-40 p-3 border-2 border-dashed rounded-lg bg-gray-100 dark:bg-gray-800 border-border-light dark:border-border-dark flex items-center justify-center text-center text-text-secondary-light dark:text-text-secondary-dark">
                            <p>
                                هذه الميزة متاحة فقط للأساليب التي تم تدريبها.
                                <br />
                                يرجى إضافة إرشادات أو أمثلة في قسم "تدريب النماذج" لتفعيلها.
                            </p>
                        </div>
                    )}
                </div>
                <div className="mt-6 flex flex-wrap gap-4">
                    {isStyleTrained && sourceText.trim() !== '' && (
                         <ActionButton onClick={handleTransformScript} text="تحويل بأسلوبي" icon="✨" color="bg-gradient-to-r from-purple-500 to-pink-500" isLoading={loadingStates.generate} />
                    )}
                    <ActionButton onClick={handleGenerateFromTitle} text="توليد النص (من العنوان)" icon="🚀" color="bg-gradient-to-r from-blue-500 to-indigo-600" isLoading={loadingStates.generate} />
                    <ActionButton onClick={handleGenerateIdeas} text="أفكار للحلقات" icon="💡" color="bg-gradient-to-r from-orange-400 to-red-500" isLoading={loadingStates.ideas} />
                    <ActionButton onClick={handleDeepResearch} text="بحث عميق" icon="🔬" color="bg-gradient-to-r from-teal-400 to-cyan-500" isLoading={loadingStates.research} />
                    <ActionButton onClick={handleFactCheck} text="تدقيق الحقائق" icon="✅" color="bg-gradient-to-r from-green-500 to-lime-600" isLoading={loadingStates.factCheck} />
                </div>
            </div>

            {script && (
                <div className="space-y-8">
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold text-text-primary-light dark:text-text-primary-dark">النص المُولّد: {script.title}</h3>
                        <button onClick={() => setIsAssetModalOpen(true)} className="flex items-center gap-2 px-4 py-2 rounded-md bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:opacity-90 transition shadow-sm hover:shadow-lg transform hover:-translate-y-px">
                            <span>🖼️</span>
                            <span>الوسائط والصوت</span>
                        </button>
                      </div>
                      <textarea
                          value={editedContent}
                          onChange={(e) => setEditedContent(e.target.value)}
                          className="w-full h-96 p-4 border rounded-lg bg-bg-secondary-light dark:bg-bg-secondary-dark border-border-light dark:border-border-dark focus:ring-primary focus:border-primary font-mono text-sm leading-relaxed"
                          placeholder="يمكنك التعديل على النص هنا..."
                      ></textarea>
                      <div className="mt-4 flex gap-3">
                        <button onClick={() => exportToWord(editedContent, script.title)} className="flex items-center gap-2 px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition">
                            <span>📝</span>
                            <span>تصدير Word</span>
                        </button>
                        <button onClick={handleAddToTrainingClick} className="flex items-center gap-2 px-4 py-2 rounded-md bg-green-600 text-white hover:bg-green-700 transition disabled:opacity-50" disabled={!script || editedContent.trim() === script.content.trim()}>
                            <span>🧠</span>
                            <span>أضف للتدريب</span>
                        </button>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-4 text-text-primary-light dark:text-text-primary-dark">تقسيم المشاهد:</h3>
                      <div className="space-y-4">
                          {script.scenes.map((scene, index) => (
                              <div key={index} className="bg-bg-secondary-light dark:bg-bg-secondary-dark p-4 rounded-lg border-r-4 border-secondary">
                                  <div className="flex justify-between items-center mb-2">
                                    <h4 className="font-bold">المشهد {index + 1}: {scene.description}</h4>
                                    <span className="bg-primary text-white text-xs font-bold px-2 py-1 rounded-full">{scene.time}</span>
                                  </div>
                                  <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark"><strong>اقتراحات بصرية:</strong> {scene.visuals}</p>
                              </div>
                          ))}
                      </div>
                    </div>
                    <div>
                        <h3 className="text-xl font-bold mb-4 text-text-primary-light dark:text-text-primary-dark">المصادر المقترحة:</h3>
                        <ul className="space-y-2">
                            {script.sources.map((source, index) => (
                                <li key={index} className="bg-bg-secondary-light dark:bg-bg-secondary-dark p-3 rounded-lg flex justify-between items-center">
                                    <span className="font-semibold">{source.name}</span>
                                    <a href={source.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-sm">
                                        زيارة المصدر
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}
             <Modal isOpen={isIdeasModalOpen} onClose={() => setIsIdeasModalOpen(false)} title={ideasModalContent.title}>
                <div className="max-h-[60vh] overflow-y-auto whitespace-pre-wrap p-1">
                    {ideasModalContent.content}
                </div>
             </Modal>
             {script && (
                 <AssetGenerationModal
                    isOpen={isAssetModalOpen}
                    onClose={() => setIsAssetModalOpen(false)}
                    scriptText={editedContent}
                    addNotification={addNotification}
                />
             )}
        </div>
    );
};

export default NewScriptForm;