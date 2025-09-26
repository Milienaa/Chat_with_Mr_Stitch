import React from 'react';
import type { Message as MessageType } from '../types';
import { Bot } from 'lucide-react';

const renderMessageText = (text: string) => {
  const parts = text.split('\n').filter(line => line.trim() !== '');
  return parts.map((line, index) => {
    if (line.startsWith('- ')) {
      return <li key={index} className="ml-4 list-disc">{line.substring(2)}</li>;
    }
    if (line.match(/\*\*(.*)\*\*/)) {
      return <strong key={index} className="block mb-1 font-semibold">{line.replace(/\*\*/g, '')}</strong>;
    }
    return <p key={index}>{line}</p>;
  });
};

interface MessageProps {
  message: MessageType;
}

const Message: React.FC<MessageProps> = ({ message }) => {
  const isAIMessage = message.user.id === 'ai';

  if (isAIMessage) {
    return (
      <div className="flex items-start gap-4 p-4 bg-cyan-500/10 border-l-4 border-cyan-500 rounded-r-lg">
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center">
          <Bot size={24} className="text-cyan-400" />
        </div>
        <div className="flex-1">
          <div className="flex items-baseline gap-2">
            <span className="font-bold text-slate-900 text-sm">{message.user.name}</span>
            <span className="text-xs text-slate-500">{message.timestamp}</span>
          </div>
          <div className="mt-1 text-slate-700 text-sm prose prose-sm max-w-none">
            {renderMessageText(message.text)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-4">
      <img src={message.user.avatarUrl} alt={message.user.name} className="w-10 h-10 rounded-full" />
      <div className="flex-1">
        <div className="flex items-baseline gap-2">
          <span className="font-bold text-slate-900 text-sm">{message.user.name}</span>
          <span className="text-xs text-slate-500">{message.timestamp}</span>
        </div>
        <p className="mt-1 text-slate-700 text-sm">{message.text}</p>
      </div>
    </div>
  );
};

export default Message;
