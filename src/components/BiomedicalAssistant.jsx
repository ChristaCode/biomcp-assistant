import React, { useState, useEffect, useRef } from 'react';
import Header from './Header';
import MessageList from './MessageList';
import InputArea from './InputArea';
import ExampleQueries from './ExampleQueries';
import { sendMessage } from '../utils/api';

const BiomedicalAssistant = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const statusIntervalRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (statusIntervalRef.current) {
        clearInterval(statusIntervalRef.current);
      }
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = {
      role: 'user',
      content: input.trim()
    };

    const queryText = input.trim().toLowerCase();
    const isBiomedicalQuery = ['paper', 'papers', 'study', 'studies', 'trial', 'trials', 'pubmed', 
      'clinical', 'gene', 'variant', 'disease', 'drug', 'treatment', 
      'biomedical', 'research', 'publication', 'article'].some(keyword => 
      queryText.includes(keyword)
    );

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setLoadingStatus('Analyzing query...');

    // Clear any existing interval
    if (statusIntervalRef.current) {
      clearInterval(statusIntervalRef.current);
    }

    // Update status based on time elapsed
    let elapsed = 0;
    statusIntervalRef.current = setInterval(() => {
      elapsed += 0.5;
      
      if (isBiomedicalQuery) {
        if (elapsed < 2) {
          setLoadingStatus('Detected biomedical query → Attempting BioMCP...');
        } else if (elapsed < 7) {
          setLoadingStatus('BioMCP connection in progress...');
        } else if (elapsed < 12) {
          setLoadingStatus('BioMCP timed out → Falling back to PubMed Direct API...');
        } else if (elapsed < 17) {
          setLoadingStatus('Querying PubMed via NCBI E-utilities...');
        } else {
          setLoadingStatus('Processing results with Claude AI...');
        }
      } else {
        setLoadingStatus('Processing with Claude AI...');
      }
    }, 500);

    try {
      const responseText = await sendMessage([...messages, userMessage]);
      const assistantMessage = {
        role: 'assistant',
        content: responseText
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'I apologize, but I encountered an error processing your request. Please try again.'
      }]);
    } finally {
      setIsLoading(false);
      setLoadingStatus('');
      if (statusIntervalRef.current) {
        clearInterval(statusIntervalRef.current);
        statusIntervalRef.current = null;
      }
    }
  };

  const handleExampleClick = (queryText) => {
    setInput(queryText);
    inputRef.current?.focus();
  };

  const handleNewChat = () => {
    setMessages([]);
    setInput('');
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/40 to-indigo-50/30 flex flex-col relative overflow-hidden">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-400/10 rounded-full blur-3xl"></div>
      </div>
      
      <Header onNewChat={handleNewChat} hasMessages={messages.length > 0} />
      
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-8 flex flex-col relative z-10">
        {messages.length === 0 ? (
          <ExampleQueries onQueryClick={handleExampleClick} />
        ) : (
          <>
            <MessageList messages={messages} isLoading={isLoading} loadingStatus={loadingStatus} />
            <div ref={messagesEndRef} />
          </>
        )}

        <InputArea
          ref={inputRef}
          input={input}
          setInput={setInput}
          onSubmit={handleSubmit}
          isLoading={isLoading}
        />
      </main>
    </div>
  );
};

export default BiomedicalAssistant;

