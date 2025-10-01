import React, { useState, useCallback } from 'react';
import type { Message, User, GeneratedDocument, SentimentAnalysis, FollowupResult, ExtractedAP, SimulationMessage, TokenUsage } from './types';
import ChatView from './components/ChatView';
import DocumentPanel from './components/DocumentPanel';
import { analyzeDialogue, generateFollowup, generateDiscussion } from './services/geminiService';
import { Bot } from 'lucide-react';
import { formatFollowupToMessage } from './utils';
import TokenUsageDisplay from './components/TokenUsageDisplay';

const INITIAL_USERS: { [key: string]: User } = {
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
  // Fix: Explicitly type the state to ensure correct type inference for `users` object. This resolves both errors.
  const [users, setUsers] = useState<{ [key: string]: User }>(INITIAL_USERS);
  const [currentUser, setCurrentUser] = useState<User>(INITIAL_USERS['1']);
  const [document, setDocument] = useState<GeneratedDocument>(INITIAL_DOCUMENT);
  const [sentiment, setSentiment] = useState<SentimentAnalysis | null>(null);
  const [tokenUsage, setTokenUsage] = useState<TokenUsage>({ input: 0, output: 0, cached: 0, total: 0 });
  
  // Loading states
  const [isAnalyzing, setIsAnalyzing] = useState(false); // For panel loading (silent analysis)
  const [isGeneratingFollowup, setIsGeneratingFollowup] = useState(false); // For chat loading (explicit request)
  const [isGeneratingDiscussion, setIsGeneratingDiscussion] = useState(false); // For simulation generation
  
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [lastFollowup, setLastFollowup] = useState<FollowupResult | null>(null);
  const [lastFollowupMessageIndex, setLastFollowupMessageIndex] = useState(0);

  // Reusable analysis function
  const runAnalysis = useCallback(async (currentMessages: Message[], isFollowup: boolean) => {
    if (currentMessages.length === 0) return;

    const handleTokenUpdate = (usage: TokenUsage | null) => {
        if (usage) {
            setTokenUsage(prev => ({
                input: prev.input + (usage.input || 0),
                output: prev.output + (usage.output || 0),
                cached: prev.cached + (usage.cached || 0),
                total: prev.total + (usage.total || 0),
            }));
        }
    };

    if (isFollowup) {
      setIsGeneratingFollowup(true);
    } else {
      setIsAnalyzing(true);
    }
    setAnalysisError(null);

    try {
      if (isFollowup) {
        const newMessagesForFollowup = currentMessages.slice(lastFollowupMessageIndex);
        // Агент "Follow-up": Підраховуємо токени для генерації звіту-підсумку
        const { result: followupResult, usage } = await generateFollowup(newMessagesForFollowup, lastFollowup);
        handleTokenUpdate(usage);

        if (followupResult) {
          const aiMessageText = formatFollowupToMessage(followupResult);
          const newAiMessage: Message = {
            id: `ai-msg-${Date.now()}`,
            text: aiMessageText,
            user: users['ai'],
            timestamp: new Date().toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' }),
          };
          setMessages(prev => [...prev, newAiMessage]);
          setLastFollowup(followupResult);
          // Set index to the point *after* the user's request, not including the AI response
          setLastFollowupMessageIndex(currentMessages.length);
        } else {
            setAnalysisError("Не вдалося згенерувати звіт.");
        }
      } else {
        // Агент "Аналітик": Підраховуємо токени для генерації проєктного документу (Action Points) та аналізу настрою діалогу
        const { result: analysisResult, usage } = await analyzeDialogue(currentMessages, document);
        handleTokenUpdate(usage);
        
        if (analysisResult?.sentimentAnalysis) {
            setSentiment(analysisResult.sentimentAnalysis);
        }

        if (analysisResult?.extractAP) {
            const summary = analysisResult.extractAP;
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
      setAnalysisError(isFollowup ? "Не вдалося згенерувати звіт." : "Не вдалося отримати аналіз від AI.");
    } finally {
      if (isFollowup) {
        setIsGeneratingFollowup(false);
      } else {
        setIsAnalyzing(false);
      }
    }
  }, [document, lastFollowup, lastFollowupMessageIndex, users]);


  const handleSendMessage = useCallback(async (text: string) => {
    const newUserMessage: Message = {
      id: `msg-${Date.now()}`,
      text,
      user: currentUser,
      timestamp: new Date().toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' }),
    };

    const updatedMessages = [...messages, newUserMessage];
    setMessages(updatedMessages);

    const isFollowupRequest = text.toLowerCase().includes('stitch');
    runAnalysis(updatedMessages, isFollowupRequest);
  }, [messages, currentUser, runAnalysis]);

  // New handler for simulation script messages
  const handleSendScriptMessages = useCallback((scriptMessages: { text: string; user: User }[]) => {
    const newMessages: Message[] = scriptMessages.map((sm, index) => ({
      id: `sim-msg-${Date.now()}-${index}`,
      text: sm.text,
      user: sm.user,
      timestamp: new Date().toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' }),
    }));

    const updatedMessages = [...messages, ...newMessages];
    setMessages(updatedMessages);

    // Always run silent analysis for script messages, not followup.
    runAnalysis(updatedMessages, false);
  }, [messages, runAnalysis]);
  
  // New handler for generating discussion
  const handleGenerateDiscussion = useCallback(async (prompt: string): Promise<SimulationMessage[] | null> => {
    setIsGeneratingDiscussion(true);
    try {
      // Генерація дискусії не враховується в загальній сумі токенів згідно з вимогою
      const result = await generateDiscussion(prompt);
      return result;
    } catch (error) {
      console.error("Discussion generation failed:", error);
      setAnalysisError("Не вдалося згенерувати діалог.");
      return null;
    } finally {
      setIsGeneratingDiscussion(false);
    }
  }, []);
  
  const handleAddUsers = useCallback((newUserNames: string[]) => {
    setUsers(currentUsers => {
      const existingNames = Object.values<User>(currentUsers).map(u => u.name);
      const usersToAdd: { [key: string]: User } = {};
      let newIdCounter = Object.keys(currentUsers).length + 1;

      newUserNames.forEach(name => {
        if (!existingNames.includes(name)) {
          const newId = `user-sim-${newIdCounter++}`;
          usersToAdd[newId] = {
            id: newId,
            name: name,
            // Generate a generic avatar for new users from scripts
            avatarUrl: `https://avatar.iran.liara.run/public?username=${encodeURIComponent(name)}`
          };
          existingNames.push(name); // Avoid adding duplicates from the same batch
        }
      });

      if (Object.keys(usersToAdd).length > 0) {
        return { ...currentUsers, ...usersToAdd };
      }
      return currentUsers;
    });
  }, []);


  return (
    <div className="flex flex-col h-screen font-sans text-slate-800 bg-slate-100">
      <header className="flex items-center justify-between p-4 bg-white border-b border-slate-200 shadow-sm flex-shrink-0">
        <div className="flex items-center gap-3">
          <Bot size={24} className="text-cyan-500" />
          <h1 className="text-xl font-bold text-slate-800">Чат з Mr Stitch</h1>
        </div>
        <TokenUsageDisplay usage={tokenUsage} />
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
          users={Object.values<User>(users).filter(u => u.id !== 'ai')}
          currentUser={currentUser}
          onSetCurrentUser={setCurrentUser}
          // Pass new props
          onSendScriptMessages={handleSendScriptMessages}
          onGenerateDiscussion={handleGenerateDiscussion}
          isGeneratingDiscussion={isGeneratingDiscussion}
          onAddUsers={handleAddUsers}
        />
      </main>
    </div>
  );
};

export default App;