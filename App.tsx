import React, { useState, useCallback } from 'react';
import type { Message, User, GeneratedDocument, SentimentAnalysis, FollowupResult, ExtractedAP } from './types';
import ChatView from './components/ChatView';
import DocumentPanel from './components/DocumentPanel';
import { analyzeDialogue, generateFollowup } from './services/geminiService';
import { Bot } from 'lucide-react';
import { formatFollowupToMessage } from './utils';

const MOCK_USERS: { [key: string]: User } = {
  '1': { id: '1', name: 'Максим', avatarUrl: 'https://avatar.iran.liara.run/public/boy?username=maksym' },
  '2': { id: '2', name: 'Андрій', avatarUrl: 'https://avatar.iran.liara.run/public/boy?username=andriy' },
  '3': { id: '3', name: 'Настя', avatarUrl: 'https://avatar.iran.liara.run/public/girl?username=nastya' },
  '4': { id: '4', name: 'Антон', avatarUrl: 'https://avatar.iran.liara.run/public/boy?username=anton' },
  'ai': { id: 'ai', name: 'Mr Stitch', avatarUrl: '' },
};


const INITIAL_DOCUMENT: GeneratedDocument = {
    title: 'Проєктний документ: Playground',
    summary: 'Цей документ автоматично генерується на основі обговорень в чаті.',
    tasks: [],
    problems: [],
    insights: [],
    openQuestions: [],
};


const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentUser, setCurrentUser] = useState<User>(MOCK_USERS['1']);
  const [document, setDocument] = useState<GeneratedDocument>(INITIAL_DOCUMENT);
  const [sentiment, setSentiment] = useState<SentimentAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false); // For panel loading
  const [isGeneratingFollowup, setIsGeneratingFollowup] = useState(false); // For chat loading
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [lastFollowup, setLastFollowup] = useState<FollowupResult | null>(null);
  const [lastFollowupMessageIndex, setLastFollowupMessageIndex] = useState(0);

  const handleSendMessage = useCallback(async (text: string) => {
    const newUserMessage: Message = {
      id: `msg-${Date.now()}`,
      text,
      user: currentUser,
      timestamp: new Date().toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' }),
    };

    const updatedMessages = [...messages, newUserMessage];
    setMessages(updatedMessages);
    setAnalysisError(null);

    const isFollowupRequest = text.toLowerCase().includes('stitch');

    if (isFollowupRequest) {
      setIsGeneratingFollowup(true);
    } else {
      setIsAnalyzing(true);
    }

    try {
      if (isFollowupRequest) {
        const newMessagesForFollowup = updatedMessages.slice(lastFollowupMessageIndex);
        const followupResult = await generateFollowup(newMessagesForFollowup, lastFollowup);

        if (followupResult) {
          const aiMessageText = formatFollowupToMessage(followupResult);
          const newAiMessage: Message = {
            id: `ai-msg-${Date.now()}`,
            text: aiMessageText,
            user: MOCK_USERS['ai'],
            timestamp: new Date().toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' }),
          };
          setMessages(prevMessages => [...prevMessages, newAiMessage]);
          setLastFollowup(followupResult);
          setLastFollowupMessageIndex(updatedMessages.length);
        } else {
            setAnalysisError("Не вдалося згенерувати звіт.");
        }
      } else {
        // Default behavior: analyze for action points silently
        const analysisResult = await analyzeDialogue(updatedMessages, document);
        
        if (analysisResult?.sentimentAnalysis) {
            setSentiment(analysisResult.sentimentAnalysis);
        }

        if (analysisResult?.extractAP) {
            const summary = analysisResult.extractAP;
            
            // AI now returns the full, managed state of the document, so we replace the old state entirely.
            setDocument(prevDoc => ({
                ...prevDoc,
                tasks: summary.tasks || [],
                problems: summary.problems || [],
                insights: summary.insights || [],
                openQuestions: summary.openQuestions || [],
            }));
        }
      }
    } catch (error) {
      console.error("Failed to get AI response:", error);
      if (isFollowupRequest) {
        setAnalysisError("Не вдалося згенерувати звіт.");
      } else {
        setAnalysisError("Не вдалося отримати аналіз від AI.");
      }
    } finally {
      if (isFollowupRequest) {
        setIsGeneratingFollowup(false);
      } else {
        setIsAnalyzing(false);
      }
    }
  }, [messages, currentUser, document, lastFollowup, lastFollowupMessageIndex]);

  return (
    <div className="flex flex-col h-screen font-sans text-slate-800 bg-slate-100">
      <header className="flex items-center justify-between p-4 bg-white border-b border-slate-200 shadow-sm flex-shrink-0">
        <div className="flex items-center gap-3">
          <Bot size={24} className="text-cyan-500" />
          <h1 className="text-xl font-bold text-slate-800">Чат з Mr Stitch</h1>
        </div>
      </header>
      <main className="flex flex-row flex-1 overflow-hidden bg-slate-50">
        <DocumentPanel 
          document={document}
          sentiment={sentiment}
          isLoading={isAnalyzing}
          error={analysisError}
        />
        <ChatView
          messages={messages}
          onSendMessage={handleSendMessage}
          isAiThinking={isGeneratingFollowup}
          users={Object.values(MOCK_USERS).filter(u => u.id !== 'ai')}
          currentUser={currentUser}
          onSetCurrentUser={setCurrentUser}
        />
      </main>
    </div>
  );
};

export default App;