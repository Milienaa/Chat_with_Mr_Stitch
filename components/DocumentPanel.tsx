import React from 'react';
import type { GeneratedDocument as GeneratedDocumentType, SentimentAnalysis as SentimentAnalysisType } from '../types';
import { FileText, Loader2, AlertTriangle, BrainCircuit } from 'lucide-react';
import Loader from './Loader';
import GeneratedDocument from './GeneratedDocument';
import SentimentAnalysis from './SentimentAnalysis';

interface DocumentPanelProps {
  document: GeneratedDocumentType | null;
  sentiment: SentimentAnalysisType | null;
  isLoading: boolean;
  error: string | null;
}

const DocumentPanel: React.FC<DocumentPanelProps> = ({ document, sentiment, isLoading, error }) => {
  
  const hasActionPoints = document && (
    document.tasks.length > 0 ||
    document.problems.length > 0 ||
    document.insights.length > 0 ||
    document.openQuestions.length > 0
  );

  return (
    <aside className="w-[450px] flex-shrink-0 bg-white border-r border-slate-200 flex flex-col p-6 overflow-y-auto">
        <SentimentAnalysis sentiment={sentiment} isLoading={isLoading} />

        <div className="flex-1 pt-6 mt-6 border-t border-slate-200">
            <div className="flex items-center justify-between mb-4">
                <h3 className="flex items-center gap-2 text-lg font-bold text-slate-800">
                    <FileText size={20} />
                    Проєктний документ
                </h3>
                {isLoading && <Loader2 size={20} className="text-cyan-500 animate-spin" />}
            </div>
            <p className="text-sm text-slate-500 -mt-3 mb-4">AI автоматично оновлює цей документ на основі чату.</p>

            {error && (
                <div className="p-3 my-4 bg-red-100 border border-red-200 text-red-700 rounded-md flex items-center gap-2 text-sm">
                    <AlertTriangle size={16} />
                    {error}
                </div>
            )}
            
            <div className="mt-2">
                {isLoading && !hasActionPoints && <Loader />}

                {!hasActionPoints && !isLoading && (
                    <div className="text-center py-10 px-4 border-2 border-dashed border-slate-200 rounded-lg">
                        <BrainCircuit size={32} className="mx-auto text-slate-400" />
                        <p className="mt-2 text-sm text-slate-500">AI-згенерований звіт з'явиться тут під час вашого спілкування.</p>
                        <p className="mt-1 text-xs text-slate-400">Напишіть повідомлення, щоб почати.</p>
                    </div>
                )}
                
                {document && hasActionPoints && (
                    <div className="space-y-4">
                        <GeneratedDocument document={document} />
                    </div>
                )}
            </div>
        </div>
    </aside>
  );
};

export default DocumentPanel;
