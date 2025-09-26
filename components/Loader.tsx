
import React from 'react';
import { Loader2 } from 'lucide-react';

const Loader: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center py-10">
      <Loader2 size={32} className="text-cyan-500 animate-spin" />
      <p className="mt-3 text-sm text-slate-500">AI оброблює інформацію...</p>
    </div>
  );
};

export default Loader;
