import React from 'react';
import type { GeneratedDocument as GeneratedDocumentType, ActionPointTask, ActionPointInsight, ActionPointProblem, ActionPointQuestion } from '../types';
import { StickyNote, AlertTriangle, HelpCircle, CheckSquare, User, Calendar } from 'lucide-react';

const TaskItem: React.FC<{ item: ActionPointTask }> = ({ item }) => (
  <li className="flex flex-col p-2.5 bg-slate-100/80 border-l-4 border-cyan-500 rounded-r-md">
    <span className="text-slate-800 text-sm">{item.title}</span>
    <div className="flex items-center gap-4 text-xs text-slate-500 mt-1.5">
      <span className="flex items-center gap-1.5"><User size={12} /> {item.responsible}</span>
      <span className="flex items-center gap-1.5"><Calendar size={12} /> {item.dueDate}</span>
    </div>
  </li>
);

const InsightItem: React.FC<{ item: ActionPointInsight }> = ({ item }) => (
  <li className="flex flex-col p-2.5 bg-slate-100/80 border-l-4 border-indigo-500 rounded-r-md">
    <span className="text-slate-800 text-sm">{item.observation}</span>
    <div className="flex items-center gap-4 text-xs text-slate-500 mt-1.5">
      <span className="flex items-center gap-1.5"><User size={12} /> {item.author}</span>
    </div>
  </li>
);

const ProblemItem: React.FC<{ item: ActionPointProblem }> = ({ item }) => (
  <li className="flex flex-col p-2.5 bg-slate-100/80 border-l-4 border-red-500 rounded-r-md">
    <span className="text-slate-800 text-sm">{item.problem}</span>
    <div className="flex items-center gap-4 text-xs text-slate-500 mt-1.5">
      <span className="flex items-center gap-1.5"><User size={12} /> {item.responsible}</span>
      <span className="flex items-center gap-1.5"><Calendar size={12} /> {item.dueDate}</span>
    </div>
  </li>
);

const QuestionItem: React.FC<{ item: ActionPointQuestion }> = ({ item }) => (
  <li className="flex flex-col p-2.5 bg-slate-100/80 border-l-4 border-amber-500 rounded-r-md">
    <span className="text-slate-800 text-sm">{item.question}</span>
    <div className="flex items-center gap-4 text-xs text-slate-500 mt-1.5">
      <span className="flex items-center gap-1.5"><User size={12} /> {item.author}</span>
    </div>
  </li>
);

const GeneratedDocument: React.FC<{ document: GeneratedDocumentType }> = ({ document }) => {
    const { tasks, insights, problems, openQuestions } = document;
    return (
        <div className="animate-fade-in space-y-6">
            <header>
                <h5 className="font-bold text-md text-slate-800">{document.title}</h5>
                <p className="text-sm text-slate-600 mt-1">{document.summary}</p>
            </header>

            <div className="space-y-4">
                {tasks.length > 0 && (
                    <div>
                        <h6 className="flex items-center gap-2 text-sm font-semibold text-slate-700"><CheckSquare size={16} className="text-cyan-600" /> Завдання</h6>
                        <ul className="mt-2 space-y-2">
                            {tasks.map((item) => <TaskItem key={item.id} item={item} />)}
                        </ul>
                    </div>
                )}
                {insights.length > 0 && (
                    <div>
                        <h6 className="flex items-center gap-2 text-sm font-semibold text-slate-700"><StickyNote size={16} className="text-indigo-600" /> Інсайти</h6>
                        <ul className="mt-2 space-y-2">
                            {insights.map((item) => <InsightItem key={item.id} item={item} />)}
                        </ul>
                    </div>
                )}
                {problems.length > 0 && (
                    <div>
                        <h6 className="flex items-center gap-2 text-sm font-semibold text-slate-700"><AlertTriangle size={16} className="text-red-600" /> Проблеми</h6>
                        <ul className="mt-2 space-y-2">
                            {problems.map((item) => <ProblemItem key={item.id} item={item} />)}
                        </ul>
                    </div>
                )}
                {openQuestions.length > 0 && (
                    <div>
                        <h6 className="flex items-center gap-2 text-sm font-semibold text-slate-700"><HelpCircle size={16} className="text-amber-600" /> Відкриті питання</h6>
                        <ul className="mt-2 space-y-2">
                            {openQuestions.map((item) => <QuestionItem key={item.id} item={item} />)}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
}

export default GeneratedDocument;