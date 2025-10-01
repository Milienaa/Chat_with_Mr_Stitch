import React, { useState } from 'react';
import { Database, Info } from 'lucide-react';
import type { TokenUsage } from '../types';
import AgentInfoModal from './AgentInfoModal';

interface TokenUsageDisplayProps {
  usage: TokenUsage;
}

const TokenUsageDisplay: React.FC<TokenUsageDisplayProps> = ({ usage }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="flex items-center gap-4 text-sm text-slate-600 bg-slate-100 hover:bg-slate-200/70 transition-colors px-3 py-1.5 rounded-lg"
        aria-label="Показати інформацію про використання токенів та агентів"
      >
        <div className="flex items-center gap-1.5" title="Деталі про AI агентів">
            <Info size={16} className="text-slate-500" />
        </div>
        <div className="h-6 w-px bg-slate-200"></div>
        <div className="flex items-center gap-2" title="Загальна кількість токенів">
          <Database size={16} className="text-slate-500" />
          <span className="font-bold">{usage.total.toLocaleString('uk-UA')}</span>
        </div>
        <div className="h-6 w-px bg-slate-200"></div>
        <div className="grid grid-cols-2 gap-x-3 gap-y-0 text-xs">
            <span className="text-slate-500">Input:</span>
            <span className="font-mono text-right">{usage.input.toLocaleString('uk-UA')}</span>
            <span className="text-slate-500">Output:</span>
            <span className="font-mono text-right">{usage.output.toLocaleString('uk-UA')}</span>
            <span className="text-slate-500">Cached:</span>
            <span className="font-mono text-right">{usage.cached.toLocaleString('uk-UA')}</span>
        </div>
      </button>
      <AgentInfoModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
};

export default TokenUsageDisplay;