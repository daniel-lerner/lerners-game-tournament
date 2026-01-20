
import React from 'react';

interface ToastProps {
  message: string;
  type: 'success' | 'info';
}

const Toast: React.FC<ToastProps> = ({ message, type }) => {
  return (
    <div className={`
      pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl border shadow-2xl 
      animate-in slide-in-from-right-full duration-300
      ${type === 'success' 
        ? 'bg-emerald-950/90 border-emerald-500/50 text-emerald-100' 
        : 'bg-indigo-950/90 border-indigo-500/50 text-indigo-100'}
    `}>
      <div className={`w-2 h-2 rounded-full ${type === 'success' ? 'bg-emerald-400' : 'bg-indigo-400'} shadow-[0_0_8px_rgba(52,211,153,0.5)]`} />
      <p className="text-sm font-bold tracking-tight">{message}</p>
    </div>
  );
};

export default Toast;
