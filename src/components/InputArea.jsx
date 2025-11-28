import React, { forwardRef, useRef, useState, useEffect } from 'react';
import { Send, Loader2, ArrowUp } from 'lucide-react';

const InputArea = forwardRef(({ input, setInput, onSubmit, isLoading }, ref) => {
  const formRef = useRef(null);
  const [isFocused, setIsFocused] = useState(false);
  const [charCount, setCharCount] = useState(0);

  useEffect(() => {
    setCharCount(input.length);
  }, [input]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    onSubmit(e);
  };

  const handleButtonClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!input.trim() || isLoading) return;
    
    const mockEvent = {
      preventDefault: () => {},
      stopPropagation: () => {},
      target: formRef.current,
      currentTarget: formRef.current
    };
    onSubmit(mockEvent);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!isLoading && input.trim()) {
        handleSubmit(e);
      }
    }
  };

  const handleInput = (e) => {
    e.target.style.height = 'auto';
    e.target.style.height = e.target.scrollHeight + 'px';
  };

  const canSend = input.trim().length > 0 && !isLoading;

  return (
    <div className="sticky bottom-0 pt-6 pb-6 bg-gradient-to-t from-white via-white/95 to-transparent backdrop-blur-sm border-t border-slate-200/60">
      <div className="max-w-4xl mx-auto px-6">
        <form 
          ref={formRef} 
          onSubmit={handleSubmit} 
          className={`relative transition-all duration-300 ${
            isFocused ? 'scale-[1.01]' : ''
          }`}
        >
          <div 
            className={`flex items-end gap-3 p-4 bg-white/90 backdrop-blur-xl rounded-2xl border-2 transition-all duration-300 ${
              isFocused 
                ? 'border-blue-400/60 shadow-xl shadow-blue-500/10' 
                : 'border-slate-200/60 shadow-lg shadow-slate-200/50'
            }`}
          >
            <div className="flex-1 relative">
              <textarea
                ref={ref}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder="Ask about biomedical research, clinical trials, genetic variants, or scientific papers..."
                className="w-full resize-none outline-none text-slate-900 placeholder-slate-400 bg-transparent min-h-[28px] max-h-[200px] leading-relaxed text-[15px]"
                rows={1}
                style={{
                  height: 'auto',
                  minHeight: '28px',
                }}
                onInput={handleInput}
                disabled={isLoading}
              />
              {charCount > 0 && (
                <div className="absolute bottom-0 right-0 text-xs text-slate-400 font-medium">
                  {charCount}
                </div>
              )}
            </div>
            
            <button
              type="button"
              onClick={handleButtonClick}
              disabled={!canSend}
              className={`send-button flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center relative z-20 transition-all duration-200 ${
                canSend
                  ? 'bg-gradient-to-br from-blue-600 via-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 hover:scale-105 active:scale-95'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }`}
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : canSend ? (
                <ArrowUp className="w-5 h-5" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
        </form>
        
        <div className="flex items-center justify-center gap-2 mt-4 text-[11px] text-slate-400">
          <span>Claude AI</span>
          <span className="text-slate-300">•</span>
          <span>PubMed</span>
          <span className="text-slate-300">•</span>
          <span>ClinicalTrials.gov</span>
        </div>
      </div>
    </div>
  );
});

InputArea.displayName = 'InputArea';

export default InputArea;

