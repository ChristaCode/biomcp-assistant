import React from 'react';
import { Beaker, Plus, Sparkles, Zap } from 'lucide-react';

const Header = ({ onNewChat, hasMessages }) => {
  return (
    <header className="border-b border-slate-200/60 bg-white/90 backdrop-blur-xl sticky top-0 z-50 shadow-sm">
      <div className="max-w-6xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 via-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-300 hover:scale-105">
                <Beaker className="w-6 h-6 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900 tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text">
                  Scienta Lab Research Assistant
                </h1>
                <Sparkles className="w-4 h-4 text-blue-500" />
              </div>
              <p className="text-xs text-slate-600 font-medium mt-1 flex items-center gap-1.5">
                <Zap className="w-3 h-3 text-amber-500" />
                AI-Powered Biomedical Research & Data Analysis
              </p>
            </div>
          </div>
          {hasMessages && (
            <button
              onClick={onNewChat}
              className="group flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/60 hover:from-blue-100 hover:to-indigo-100 hover:border-blue-300/60 text-slate-700 text-sm font-semibold transition-all duration-200 shadow-sm hover:shadow-md hover:scale-105 active:scale-95"
            >
              <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-200" />
              <span>New Chat</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;

