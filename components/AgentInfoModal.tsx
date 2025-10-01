import React from 'react';
import ReactDOM from 'react-dom';
import { BrainCircuit, MessageSquareQuote, FileText, X, CheckCircle, Component, Cpu } from 'lucide-react';

interface AgentInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AgentInfoModal: React.FC<AgentInfoModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const modalContent = (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="agent-info-title"
    >
      <div 
        className="bg-white rounded-xl shadow-2xl w-full max-w-3xl m-4 animate-fade-in"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
      >
        <header className="flex items-center justify-between p-5 border-b border-slate-200">
          <h2 id="agent-info-title" className="flex items-center gap-3 text-lg font-bold text-slate-800">
            <Cpu size={24} className="text-cyan-500" />
            Інформація про AI-Агентів
          </h2>
          <button 
            onClick={onClose} 
            className="p-1 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-full transition-colors"
            aria-label="Закрити модальне вікно"
          >
            <X size={20} />
          </button>
        </header>

        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          
          {/* Agent 1: Document Analyst */}
          <div className="p-4 border border-slate-200 rounded-lg bg-slate-50">
            <h3 className="flex items-center gap-2 font-semibold text-slate-800">
              <BrainCircuit size={20} className="text-indigo-500" />
              1. Аналітик Проєктного Документу
            </h3>
            <p className="mt-2 text-sm text-slate-600">
              <strong>Ціль:</strong> Працює у фоні після кожного повідомлення, щоб підтримувати проєктний документ в актуальному стані. Він аналізує весь діалог, видаляє вирішені завдання, оновлює існуючі та додає нові.
            </p>
            <div className="mt-3 text-sm space-y-2">
                <div className="flex items-start gap-2">
                    <Component size={16} className="flex-shrink-0 mt-0.5 text-slate-500" />
                    <p><strong>Використовує інструмент (Tool):</strong> <code>updateProjectDocument</code></p>
                </div>
                 <div className="flex items-start gap-2">
                    <CheckCircle size={16} className="flex-shrink-0 mt-0.5 text-green-500" />
                    <p className="font-medium text-slate-700">
                        Токени цього агента враховуються в загальному лічильнику. <br/>
                        <span className="font-normal text-slate-500 text-xs">Це включає одночасну генерацію і проєктного документу (action points), і аналізу настрою (sentiment analysis).</span>
                    </p>
                </div>
            </div>
          </div>

          {/* Agent 2: Follow-up Generator */}
          <div className="p-4 border border-slate-200 rounded-lg bg-slate-50">
            <h3 className="flex items-center gap-2 font-semibold text-slate-800">
              <MessageSquareQuote size={20} className="text-amber-500" />
              2. Генератор Follow-up Звітів
            </h3>
            <p className="mt-2 text-sm text-slate-600">
              <strong>Ціль:</strong> Активується, коли користувач пише повідомлення зі словом "stitch". Аналізує останній сегмент розмови та створює детальний звіт-підсумок.
            </p>
            <div className="mt-3 text-sm space-y-2">
                <div className="flex items-start gap-2">
                    <Component size={16} className="flex-shrink-0 mt-0.5 text-slate-500" />
                    <p><strong>Використовує інструмент (Tool):</strong> <code>createDiscussionFollowup</code></p>
                </div>
                <div className="flex items-start gap-2">
                    <CheckCircle size={16} className="flex-shrink-0 mt-0.5 text-green-500" />
                    <p className="font-medium text-slate-700">Токени цього агента враховуються в загальному лічильнику.</p>
                </div>
            </div>
          </div>

          {/* Agent 3: Dialogue Scenarist */}
          <div className="p-4 border border-slate-200 rounded-lg bg-slate-50">
            <h3 className="flex items-center gap-2 font-semibold text-slate-800">
              <FileText size={20} className="text-rose-500" />
              3. Сценарист Діалогів
            </h3>
            <p className="mt-2 text-sm text-slate-600">
              <strong>Ціль:</strong> Використовується в "Інструментах тестування" для генерації реалістичного діалогу на основі промпту. Допомагає створювати тестові дані.
            </p>
            <div className="mt-3 text-sm space-y-2">
                <div className="flex items-start gap-2">
                    <Component size={16} className="flex-shrink-0 mt-0.5 text-slate-500" />
                    <p><strong>Використовує:</strong> Генерацію в JSON-форматі (<code>responseSchema</code>), а не іменовані інструменти.</p>
                </div>
                <div className="flex items-start gap-2">
                    <X size={16} className="flex-shrink-0 mt-0.5 text-red-500" />
                    <p className="font-medium text-slate-700">Токени цього агента **не враховуються** в загальному лічильнику згідно з вимогами.</p>
                </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );

  const modalRoot = document.getElementById('modal-root');
  return modalRoot ? ReactDOM.createPortal(modalContent, modalRoot) : null;
};

export default AgentInfoModal;