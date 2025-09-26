
import React from 'react';
import type { ProjectChannel } from '../types';
import { Bot } from 'lucide-react';

interface SidebarProps {
  channels: ProjectChannel[];
  activeChannelId: string;
  onSelectChannel: (id: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ channels, activeChannelId, onSelectChannel }) => {
  return (
    <aside className="w-64 bg-slate-800 text-slate-200 flex flex-col">
      <div className="p-4 border-b border-slate-700 flex items-center gap-3">
        <Bot size={28} className="text-cyan-400" />
        <h2 className="text-xl font-bold">AI Асистент</h2>
      </div>
      <nav className="flex-1 p-2">
        <h3 className="px-2 py-1 text-xs font-semibold tracking-wider uppercase text-slate-400">Проєкти</h3>
        <ul>
          {channels.map(channel => (
            <li key={channel.id}>
              <button
                onClick={() => onSelectChannel(channel.id)}
                className={`w-full text-left px-3 py-2 rounded-md transition-colors duration-200 flex items-center gap-3 ${
                  activeChannelId === channel.id
                    ? 'bg-cyan-500/20 text-white font-semibold'
                    : 'hover:bg-slate-700'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${activeChannelId === channel.id ? 'bg-cyan-400' : 'bg-slate-500'}`}></span>
                {channel.name}
              </button>
            </li>
          ))}
        </ul>
      </nav>
      <div className="p-4 border-t border-slate-700 text-xs text-slate-400">
        <p>&copy; 2025 Mr Stitch</p>
      </div>
    </aside>
  );
};

export default Sidebar;
