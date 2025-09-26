
import React, { useState, useRef, useEffect } from 'react';
import type { Message as MessageType, User } from '../types';
import { SendHorizonal, Loader2 } from 'lucide-react';
import Message from './Message';

interface ChatViewProps {
  messages: MessageType[];
  onSendMessage: (text: string) => void;
  isAiThinking: boolean;
  users: User[];
  currentUser: User;
  onSetCurrentUser: (user: User) => void;
}

const ChatView: React.FC<ChatViewProps> = ({ messages, onSendMessage, isAiThinking, users, currentUser, onSetCurrentUser }) => {
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      onSendMessage(newMessage.trim());
      setNewMessage('');
    }
  };

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="space-y-6">
          {messages.map(msg => (
            <Message key={msg.id} message={msg} />
          ))}
           {messages.length === 0 && (
            <div className="text-center text-slate-500 pt-10">
              <p>Чат порожній.</p>
              <p className="text-sm">Оберіть користувача та напишіть перше повідомлення, щоб почати.</p>
            </div>
          )}
        </div>
        <div ref={messagesEndRef} />
      </div>

      {isAiThinking && (
        <div className="px-6 pb-2 flex items-center gap-2 text-sm text-slate-500 animate-pulse">
          <Loader2 size={16} className="animate-spin" />
          <span>Mr Stitch аналізує...</span>
        </div>
      )}
      
      <div className="p-4 bg-white border-t border-slate-200">
        <div className="mb-3">
            <label className="text-xs font-semibold text-slate-500 block mb-2">Відправка від імені:</label>
            <div className="flex flex-wrap items-center gap-2">
                {users.map(user => (
                    <button 
                        key={user.id} 
                        onClick={() => onSetCurrentUser(user)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all text-sm font-medium ${currentUser.id === user.id ? 'bg-cyan-500 text-white shadow' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}
                        aria-pressed={currentUser.id === user.id}
                    >
                        <img src={user.avatarUrl} alt={user.name} className="w-6 h-6 rounded-full" />
                        <span>{user.name}</span>
                    </button>
                ))}
            </div>
        </div>
        <form onSubmit={handleSubmit} className="flex items-center gap-3">
          <input
            type="text"
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
            placeholder={`Повідомлення від ${currentUser.name}...`}
            className="w-full px-4 py-2 bg-slate-100 border border-slate-200 rounded-full focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm"
          />
          <button
            type="submit"
            className="p-3 bg-cyan-500 text-white rounded-full hover:bg-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 transition-colors disabled:bg-slate-400"
            disabled={!newMessage.trim()}
          >
            <SendHorizonal size={20} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatView;