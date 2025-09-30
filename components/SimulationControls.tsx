import React, { useState, useRef } from 'react';
import { Bot, ChevronDown, Loader2, Play, FileText, Send } from 'lucide-react';
import type { User, SimulationMessage } from '../types';

interface SimulationControlsProps {
    users: User[];
    onSendScriptMessages: (messages: { text: string; user: User }[]) => void;
    onGenerateDiscussion: (prompt: string) => Promise<SimulationMessage[] | null>;
    isGenerating: boolean;
    onAddUsers: (newUserNames: string[]) => void;
}

const PROMPT_TEMPLATE = `Згенеруй дискусію на тему [впровадження нової дизайн-системи].
Де зімітуєш Slack-чат на [30-40] повідомлень.
Діалог почнеться із [оптимістичного настрою].
Ініціатор буде [Максим].
Супротив йому складе [Андрій], він переживає за терміни.
Максимальний скептик [Антон], він вважає, що стара система краща.
Злагоджує конфлікт [Настя].
Ділог має завершитись на [домовленості].`;

const SimulationControls: React.FC<SimulationControlsProps> = ({ users, onSendScriptMessages, onGenerateDiscussion, isGenerating, onAddUsers }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'generate' | 'file'>('generate');
    
    const [script, setScript] = useState<SimulationMessage[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [chunkSize, setChunkSize] = useState(3);
    const [prompt, setPrompt] = useState(PROMPT_TEMPLATE);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target?.result as string;
            try {
                const parsedScript = text.split('\n').map(line => line.trim()).filter(line => line.includes(':')).map(line => {
                    const [userName, ...textParts] = line.split(':');
                    return { userName: userName.trim(), text: textParts.join(':').trim() };
                });
                
                if (parsedScript.length === 0 || parsedScript.every(p => !p.text)) {
                  setError('Файл порожній або має невірний формат. Очікуваний формат: "Ім\'я: Повідомлення".');
                  return;
                }
                
                const validScript = parsedScript.filter(p => p.text);
                setScript(validScript);
                setCurrentIndex(0);
                setError(null);
                
                // Automatically discover and add new users from the script
                const scriptUserNames = [...new Set(validScript.map(p => p.userName))];
                const existingUserNames = users.map(u => u.name);
                const newUserNames = scriptUserNames.filter(name => !existingUserNames.includes(name));

                if (newUserNames.length > 0) {
                    onAddUsers(newUserNames);
                }

            } catch (err) {
                setError('Не вдалося обробити файл. Перевірте формат.');
                console.error(err);
            }
        };
        reader.onerror = () => {
             setError('Не вдалося прочитати файл.');
        }
        reader.readAsText(file);
    };

    const handleGenerate = async () => {
        setError(null);
        const generatedScript = await onGenerateDiscussion(prompt);
        if (generatedScript) {
            setScript(generatedScript);
            setCurrentIndex(0);
        } else {
            setError('Не вдалося згенерувати дискусію. Спробуйте ще раз.');
        }
    };

    const handleSendChunk = () => {
        if (currentIndex >= script.length) return;
        
        const end = Math.min(currentIndex + chunkSize, script.length);
        const chunk = script.slice(currentIndex, end);

        const messagesToSend = chunk.map(({ userName, text }) => {
            const user = users.find(u => u.name === userName);
             // If user is not found, skip the message instead of sending as someone else.
            if (!user) {
                console.warn(`User "${userName}" from script not found in user list. Skipping message.`);
                return null;
            }
            return { text, user };
        }).filter((item): item is { text: string; user: User } => item !== null);

        if(messagesToSend.length > 0) {
            onSendScriptMessages(messagesToSend);
        }
        
        setCurrentIndex(end);
    };
    
    const isScriptLoaded = script.length > 0;
    const isSimulationFinished = isScriptLoaded && currentIndex >= script.length;

    return (
        <div className="bg-slate-50 text-sm">
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center p-3 text-slate-600 font-semibold hover:bg-slate-100"
                aria-expanded={isOpen}
            >
                <span>Інструменти тестування</span>
                <ChevronDown size={20} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && (
                <div className="p-4 border-t border-slate-200 animate-fade-in">
                    <div className="flex border-b border-slate-200 mb-4">
                        <button onClick={() => setActiveTab('generate')} className={`px-4 py-2 text-sm font-medium ${activeTab === 'generate' ? 'border-b-2 border-cyan-500 text-cyan-600' : 'text-slate-500'}`}>
                            <Bot size={16} className="inline-block mr-2" />
                            Згенерувати діалог
                        </button>
                        <button onClick={() => setActiveTab('file')} className={`px-4 py-2 text-sm font-medium ${activeTab === 'file' ? 'border-b-2 border-cyan-500 text-cyan-600' : 'text-slate-500'}`}>
                            <FileText size={16} className="inline-block mr-2" />
                            Завантажити з файлу
                        </button>
                    </div>

                    {error && (
                        <div className="p-2 mb-3 bg-red-100 text-red-700 rounded-md text-xs">{error}</div>
                    )}

                    {activeTab === 'generate' && (
                        <div className="space-y-3">
                            <label className="font-semibold text-slate-600 block">Промпт для генерації</label>
                            <textarea
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                rows={8}
                                className="w-full p-2 bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 text-xs"
                                placeholder="Опишіть сценарій дискусії..."
                            />
                            <button onClick={handleGenerate} disabled={isGenerating} className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-slate-700 text-white rounded-md hover:bg-slate-800 disabled:bg-slate-400">
                                {isGenerating ? <><Loader2 size={16} className="animate-spin" /> Генеруємо...</> : <><Play size={16} /> Згенерувати</>}
                            </button>
                        </div>
                    )}

                    {activeTab === 'file' && (
                        <div className="space-y-3">
                           <label className="font-semibold text-slate-600 block">Завантажити .txt файл</label>
                           <p className="text-xs text-slate-500 -mt-2 mb-2">Формат: `Ім'я: Повідомлення` на кожному рядку.</p>
                            <input
                                type="file"
                                accept=".txt"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-cyan-50 file:text-cyan-700 hover:file:bg-cyan-100"
                            />
                        </div>
                    )}
                    
                    {isScriptLoaded && (
                         <div className="mt-4 p-4 border-t border-dashed border-slate-300 space-y-3">
                             <div className="flex items-center justify-between">
                                 <label htmlFor="chunk-size" className="font-semibold text-slate-600">Керування відправкою</label>
                                 <span className="text-xs text-slate-500 font-mono">
                                     {currentIndex}/{script.length} повідомлень
                                 </span>
                             </div>
                             <div className="flex items-center gap-3">
                                 <input
                                     id="chunk-size"
                                     type="number"
                                     value={chunkSize}
                                     onChange={(e) => setChunkSize(Math.max(1, parseInt(e.target.value, 10)))}
                                     className="w-20 p-2 text-center bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                     min="1"
                                 />
                                 <button onClick={handleSendChunk} disabled={isSimulationFinished} className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-cyan-500 text-white rounded-md hover:bg-cyan-600 disabled:bg-slate-400">
                                     <Send size={16} />
                                     {isSimulationFinished ? 'Завершено' : `Надіслати наступні ${chunkSize || 1}`}
                                 </button>
                             </div>
                         </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default SimulationControls;