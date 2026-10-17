import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'warning';
  title: string;
  description?: string;
}

interface ToastContextType {
  showToast: (title: string, description?: string, type?: 'success' | 'info' | 'warning') => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback((title: string, description?: string, type: 'success' | 'info' | 'warning' = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, title, description, type }]);

    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none max-w-sm w-full">
        <AnimatePresence>
          {toasts.map(toast => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 15, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className="pointer-events-auto flex items-start gap-3 p-3.5 rounded-lg border backdrop-blur-xl bg-[#090e23]/90 shadow-[0_0_20px_rgba(0,0,0,0.5)] border-slate-700/60"
              style={{
                borderColor: 
                  toast.type === 'success' ? 'rgba(6, 182, 212, 0.4)' : 
                  toast.type === 'warning' ? 'rgba(236, 72, 153, 0.4)' : 
                  'rgba(168, 85, 247, 0.4)'
              }}
            >
              <div className="mt-0.5">
                {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-cyan-400" />}
                {toast.type === 'warning' && <AlertTriangle className="w-5 h-5 text-pink-500" />}
                {toast.type === 'info' && <Info className="w-5 h-5 text-purple-400" />}
              </div>
              <div className="flex-1 text-xs">
                <div className="font-semibold text-slate-100 font-mono tracking-wide">
                  {toast.title}
                </div>
                {toast.description && (
                  <div className="text-slate-400 mt-0.5 font-sans">
                    {toast.description}
                  </div>
                )}
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-slate-500 hover:text-slate-200 transition-colors p-0.5 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
