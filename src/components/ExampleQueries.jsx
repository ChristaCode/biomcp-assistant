import React from 'react';
import { FileText, Beaker, Activity, ChevronDown, Sparkles, Database, Search } from 'lucide-react';

const ExampleQueries = ({ onQueryClick }) => {
  const exampleQueries = [
    {
      icon: <FileText className="w-5 h-5" />,
      text: "Find papers about TNF-alpha inhibitors in inflammatory bowel disease",
      category: "Literature Search",
      iconBg: "from-blue-50 to-blue-100",
      iconHover: "from-blue-100 to-blue-200",
      iconColor: "text-blue-600",
      categoryColor: "text-blue-600"
    },
    {
      icon: <Beaker className="w-5 h-5" />,
      text: "Are there any clinical trials for adalimumab in Crohn's disease?",
      category: "Clinical Trials",
      iconBg: "from-indigo-50 to-indigo-100",
      iconHover: "from-indigo-100 to-indigo-200",
      iconColor: "text-indigo-600",
      categoryColor: "text-indigo-600"
    },
    {
      icon: <Activity className="w-5 h-5" />,
      text: "What do we know about the rs113488022 genetic variant?",
      category: "Genetics",
      iconBg: "from-purple-50 to-purple-100",
      iconHover: "from-purple-100 to-purple-200",
      iconColor: "text-purple-600",
      categoryColor: "text-purple-600"
    }
  ];

  const features = [
    { icon: <Database className="w-4 h-4" />, text: "PubMed Integration" },
    { icon: <Search className="w-4 h-4" />, text: "Clinical Trials" },
    { icon: <Sparkles className="w-4 h-4" />, text: "AI-Powered Analysis" }
  ];

  return (
    <div className="flex-1 flex flex-col items-center justify-center pb-20 fade-in-up">
      <div className="text-center mb-12 max-w-3xl mx-auto">
        <div className="relative inline-block mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-600 rounded-2xl blur-xl opacity-30 animate-pulse"></div>
          <div className="relative inline-flex items-center justify-center w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 shadow-2xl shadow-blue-500/40">
            <Beaker className="w-12 h-12 text-white" />
          </div>
        </div>
        <h2 className="text-4xl font-bold text-slate-900 mb-4 tracking-tight bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 bg-clip-text">
          Welcome to Your Research Assistant
        </h2>
        <p className="text-slate-600 text-lg max-w-2xl mx-auto leading-relaxed mb-6">
          Query biomedical databases, analyze scientific literature, and explore clinical trials through natural language conversations powered by AI.
        </p>
        
        <div className="flex items-center justify-center gap-6 mt-8">
          {features.map((feature, idx) => (
            <div 
              key={idx}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 text-slate-700 text-sm font-medium"
            >
              {feature.icon}
              <span>{feature.text}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="w-full max-w-3xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-300 to-transparent"></div>
          <span className="text-sm font-semibold text-slate-600 tracking-wide uppercase flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-500" />
            Try These Examples
          </span>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-300 to-transparent"></div>
        </div>

        <div className="grid gap-4">
          {exampleQueries.map((query, idx) => (
            <button
              key={idx}
              onClick={() => onQueryClick(query.text)}
              className="example-card text-left p-6 rounded-2xl bg-white/80 backdrop-blur-sm border border-slate-200/60 hover:border-blue-300/60 cursor-pointer group transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10"
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${query.iconBg} group-hover:${query.iconHover} flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3`}>
                  <div className={query.iconColor}>
                    {query.icon}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-xs font-semibold ${query.categoryColor} uppercase tracking-wide`}>
                      {query.category}
                    </span>
                  </div>
                  <p className="text-slate-700 leading-relaxed group-hover:text-slate-900 transition-colors font-medium">
                    {query.text}
                  </p>
                </div>
                <ChevronDown className="w-5 h-5 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all duration-300 flex-shrink-0" />
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-16 scroll-indicator">
        <ChevronDown className="w-6 h-6 text-slate-400" />
      </div>
    </div>
  );
};

export default ExampleQueries;

