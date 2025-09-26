
import React from 'react';
import { Smile, Meh, Frown, Blend, Bot, Loader2, Lightbulb, Sparkles, ShieldQuestion, Circle } from 'lucide-react';
import type { SentimentAnalysis as SentimentAnalysisType, ParticipantStance, StanceType } from '../types';

interface SentimentAnalysisProps {
    sentiment: SentimentAnalysisType | null;
    isLoading: boolean;
}

const sentimentConfig = {
    POSITIVE: { icon: Smile, color: 'text-green-500', label: 'Позитивний' },
    NEUTRAL: { icon: Meh, color: 'text-slate-500', label: 'Нейтральний' },
    NEGATIVE: { icon: Frown, color: 'text-red-500', label: 'Негативний' },
    MIXED: { icon: Blend, color: 'text-amber-500', label: 'Змішаний' }
};

const stanceConfig: Record<StanceType, { icon: React.ElementType, color: string, label: string }> = {
    INITIATORS: { icon: Lightbulb, color: 'text-indigo-500', label: 'Ініціатори' },
    ENTHUSIASTS: { icon: Sparkles, color: 'text-amber-500', label: 'Ентузіасти' },
    CRITICS: { icon: ShieldQuestion, color: 'text-orange-500', label: 'Критики' },
    NEUTRALS: { icon: Circle, color: 'text-slate-500', label: 'Нейтрали' }
};


const SentimentAnalysis: React.FC<SentimentAnalysisProps> = ({ sentiment, isLoading }) => {
    
    const renderOverallSentiment = () => {
        if (isLoading && !sentiment) {
            return (
                <div className="flex items-center gap-3 animate-pulse">
                     <div className="flex-shrink-0 w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center">
                        <Loader2 size={20} className="text-slate-400 animate-spin" />
                    </div>
                    <div>
                        <div className="h-4 w-24 bg-slate-200 rounded"></div>
                        <div className="h-3 w-48 bg-slate-200 rounded mt-1.5"></div>
                    </div>
                </div>
            );
        }

        if (!sentiment) {
             return (
                <div className="flex items-center gap-3">
                     <div className="flex-shrink-0 w-10 h-10 rounded-full bg-cyan-500/10 flex items-center justify-center">
                        <Bot size={20} className="text-cyan-500" />
                    </div>
                    <div>
                        <p className="font-semibold text-slate-700 text-sm">Аналіз тону</p>
                        <p className="text-xs text-slate-500">AI проаналізує настрій діалогу.</p>
                    </div>
                </div>
            );
        }

        const config = sentimentConfig[sentiment.tone] || sentimentConfig.NEUTRAL;
        const Icon = config.icon;

        return (
            <div className="flex items-center gap-3">
                <div className={`flex-shrink-0 w-10 h-10 rounded-full bg-${config.color.replace('text-', '')}/10 flex items-center justify-center`}>
                    <Icon size={20} className={config.color} />
                </div>
                <div>
                    <p className={`font-semibold ${config.color} text-sm`}>{config.label}</p>
                    <p className="text-xs text-slate-500">{sentiment.summary}</p>
                </div>
            </div>
        )
    }
    
    const renderParticipantStances = () => {
      if (!sentiment?.participantStances || sentiment.participantStances.length === 0) {
        return null;
      }

      return (
        <div className="mt-6 pt-4 border-t border-slate-200">
            <h4 className="text-xs font-semibold tracking-wider uppercase text-slate-400 mb-4">Позиції учасників</h4>
            <div className="space-y-4">
                {sentiment.participantStances.map((stanceGroup, index) => {
                    const config = stanceConfig[stanceGroup.stance] || stanceConfig.NEUTRALS;
                    const Icon = config.icon;
                    return (
                        <div key={index} className="flex items-start gap-3">
                            <div className={`flex-shrink-0 w-8 h-8 mt-0.5 rounded-full bg-${config.color.replace('text-', '')}/10 flex items-center justify-center`}>
                                <Icon size={16} className={config.color} />
                            </div>
                            <div>
                                <p className={`font-semibold ${config.color} text-sm`}>{config.label}</p>
                                <p className="text-xs text-slate-600 font-medium mt-0.5">
                                    {stanceGroup.participants.join(', ')}
                                </p>
                                <p className="text-xs text-slate-500 mt-1 italic">
                                    "{stanceGroup.summary}"
                                </p>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
      );
    }


    return (
        <div>
            <h3 className="text-xs font-semibold tracking-wider uppercase text-slate-400 mb-3">Настрій діалогу</h3>
            {renderOverallSentiment()}
            {renderParticipantStances()}
        </div>
    );
};

export default SentimentAnalysis;
