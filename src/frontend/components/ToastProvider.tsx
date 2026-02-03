"use client";

import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
    id: string;
    message: string;
    type: ToastType;
}

interface ToastContextType {
    showToast: (message: string, type: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) throw new Error('useToast must be used within ToastProvider');
    return context;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = useCallback((message: string, type: ToastType) => {
        const id = Math.random().toString(36).substring(2, 9);
        setToasts((prev) => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 5000);
    }, []);

    const removeToast = (id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
                <AnimatePresence>
                    {toasts.map((toast) => (
                        <motion.div
                            key={toast.id}
                            initial={{ opacity: 0, y: 20, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                            className="pointer-events-auto"
                        >
                            <div className={`
                flex items-center gap-4 px-6 py-4 rounded-2xl border backdrop-blur-xl shadow-2xl min-w-[320px] max-w-md
                ${toast.type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-400' :
                                    toast.type === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-400' :
                                        'bg-blue-500/10 border-blue-500/20 text-blue-400'}
              `}>
                                <div className="shrink-0">
                                    {toast.type === 'success' && <CheckCircle2 className="w-6 h-6" />}
                                    {toast.type === 'error' && <AlertCircle className="w-6 h-6" />}
                                    {toast.type === 'info' && <Info className="w-6 h-6" />}
                                </div>

                                <div className="flex-1">
                                    <p className="text-sm font-bold leading-tight">{toast.message}</p>
                                </div>

                                <button
                                    onClick={() => removeToast(toast.id)}
                                    className="shrink-0 hover:bg-white/5 p-1 rounded-lg transition-colors"
                                >
                                    <X className="w-4 h-4 opacity-40 hover:opacity-100" />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    );
};
