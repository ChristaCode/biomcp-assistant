import React from 'react';
import { Beaker, Loader2, User, Sparkles, Database } from 'lucide-react';

// Simple markdown-like formatting helper
const formatMessage = (text) => {
  if (!text) return '';
  
  // Split by lines and process
  const lines = text.split('\n');
  const formatted = [];
  
  lines.forEach((line, idx) => {
    const trimmed = line.trim();
    
    // Headers
    if (trimmed.startsWith('## ')) {
      formatted.push(
        <h2 key={idx} className="text-xl font-semibold mt-6 mb-3 text-slate-900 first:mt-0">
          {trimmed.substring(3)}
        </h2>
      );
    } else if (trimmed.startsWith('### ')) {
      formatted.push(
        <h3 key={idx} className="text-lg font-semibold mt-4 mb-2 text-slate-800">
          {trimmed.substring(4)}
        </h3>
      );
    }
    // Bold text
    else if (trimmed.startsWith('**') && trimmed.endsWith('**')) {
      formatted.push(
        <p key={idx} className="mb-2">
          <strong>{trimmed.slice(2, -2)}</strong>
        </p>
      );
    }
    // Lists
    else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      formatted.push(
        <li key={idx} className="ml-4 mb-1 list-disc">
          {trimmed.substring(2)}
        </li>
      );
    }
    // Code blocks (simple detection)
    else if (trimmed.startsWith('`') && trimmed.endsWith('`')) {
      formatted.push(
        <code key={idx} className="bg-slate-100 text-slate-800 px-2 py-1 rounded text-sm font-mono">
          {trimmed.slice(1, -1)}
        </code>
      );
    }
    // Regular paragraphs
    else if (trimmed) {
      formatted.push(
        <p key={idx} className="mb-3 last:mb-0">
          {trimmed}
        </p>
      );
    } else {
      formatted.push(<br key={idx} />);
    }
  });
  
  return formatted;
};

// Extract source information from message content
const extractSource = (content) => {
  if (!content) return null;
  
  // Look for source indicators in the text
  if (content.includes('BioMCP') || content.includes('BioMCP Server')) {
    return { type: 'biomcp', label: 'BioMCP Server' };
  }
  if (content.includes('PubMed Direct API') || content.includes('NCBI E-utilities')) {
    return { type: 'pubmed', label: 'PubMed Direct API' };
  }
  
  return null;
};

const MessageList = ({ messages, isLoading, loadingStatus }) => {
  return (
    <div className="flex-1 overflow-y-auto mb-6 space-y-6 pb-4 scroll-smooth">
      {messages.map((message, idx) => {
        const source = message.role === 'assistant' ? extractSource(message.content) : null;
        
        return (
          <div
            key={idx}
            className={`message-enter flex ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-3xl w-full ${
                message.role === 'user'
                  ? 'bg-gradient-to-br from-blue-600 via-blue-600 to-indigo-600 text-white rounded-2xl rounded-br-md px-6 py-4 shadow-xl shadow-blue-500/25 hover:shadow-2xl hover:shadow-blue-500/30 transition-all duration-300'
                  : 'bg-white/80 backdrop-blur-sm border border-slate-200/80 rounded-2xl rounded-bl-md px-6 py-5 shadow-lg hover:shadow-xl transition-all duration-300'
              }`}
            >
              {message.role === 'assistant' && (
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 flex items-center justify-center shadow-md">
                      <Beaker className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-slate-700 tracking-wide uppercase block">
                        Research Assistant
                      </span>
                      {source && (
                        <div className="flex items-center gap-1.5 mt-1">
                          <Database className="w-3 h-3 text-slate-500" />
                          <span className="text-xs text-slate-500 font-medium">
                            {source.label}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <Sparkles className="w-4 h-4 text-blue-500/60" />
                </div>
              )}
              
              {message.role === 'user' && (
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                    <User className="w-3.5 h-3.5 text-white" />
                  </div>
                  <span className="text-xs font-medium text-white/90 uppercase tracking-wide">
                    You
                  </span>
                </div>
              )}
              
              <div className={`${
                message.role === 'user' 
                  ? 'text-white/95' 
                  : 'text-slate-700 prose prose-slate max-w-none'
              } leading-relaxed`}>
                {message.role === 'assistant' ? (
                  <div className="message-content">
                    {formatMessage(message.content)}
                  </div>
                ) : (
                  <p className="whitespace-pre-wrap">{message.content}</p>
                )}
              </div>
            </div>
          </div>
        );
      })}
      
      {isLoading && (
        <div className="flex justify-start message-enter">
          <div className="max-w-3xl w-full bg-white/80 backdrop-blur-sm border border-slate-200/80 rounded-2xl rounded-bl-md px-6 py-5 shadow-lg">
            <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-slate-100">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 flex items-center justify-center shadow-md">
                <Beaker className="w-4 h-4 text-white" />
              </div>
              <span className="text-xs font-semibold text-slate-700 tracking-wide uppercase">
                Research Assistant
              </span>
            </div>
            <div className="flex items-center gap-3 text-slate-600">
              <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
              <div className="flex flex-col gap-1">
                <span className="text-sm font-medium">
                  {loadingStatus || 'Processing your request...'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessageList;

