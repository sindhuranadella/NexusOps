import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Download,
  Settings2,
  Layers,
  ShieldCheck,
  RotateCcw
} from 'lucide-react';
import { aiService, AIChatMessage } from '../services/aiService';
import { apiService } from '../services/api';

export const AIOperations: React.FC = () => {
  const [messages, setMessages] = useState<AIChatMessage[]>([
    {
      id: 'init-1',
      sender: 'assistant',
      timestamp: new Date().toISOString(),
      content:
        'Hello Elena. I am the **NexusOps AI Operations Intelligence Engine**.\n\n' +
        'I am continuously monitoring real-time telemetry from **11 registered services**, **4 active database and messaging clusters**, and **3 open incidents**.\n\n' +
        'All hypotheses generated strictly cite correlated logs, metrics, or deployment diffs.',
      evidenceCitations: ['NexusOps Central Telemetry Feed', 'Prometheus AlertManager'],
      suggestedFollowUps: [
        'Explain current P1 incident root cause',
        'Analyze blast radius of Payment Outage',
        'Audit SLA risks for next 24 hours',
        'Draft an executive summary of current P1 incidents'
      ]
    }
  ]);

  const [inputQuery, setInputQuery] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedModel, setSelectedModel] = useState('gemini-2.5-flash');
  const [strictness, setStrictness] = useState<'strict' | 'balanced'>('strict');
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isGenerating]);

  const handleSendMessage = async (queryText?: string) => {
    const text = (queryText || inputQuery).trim();
    if (!text || isGenerating) return;

    const userMsg: AIChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      timestamp: new Date().toISOString(),
      content: text
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsGenerating(true);

    try {
      const response = await aiService.askOperationsCopilot(text);
      setMessages((prev) => [...prev, response]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'assistant',
          timestamp: new Date().toISOString(),
          content: 'An error occurred while communicating with the operations AI service. Please retry.'
        }
      ]);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExportChat = () => {
    const markdown = messages
      .map(
        (m) =>
          `### ${m.sender === 'user' ? 'Operator' : 'NexusOps AI'} (${new Date(
            m.timestamp
          ).toLocaleTimeString()}):\n${m.content}\n`
      )
      .join('\n---\n\n');

    const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `nexusops_ai_briefing_${Date.now()}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: `init-${Date.now()}`,
        sender: 'assistant',
        timestamp: new Date().toISOString(),
        content: 'Session reset. How can I assist with platform reliability and incident response today?',
        suggestedFollowUps: [
          'Explain current P1 incident root cause',
          'Analyze blast radius of Payment Outage',
          'Audit SLA risks for next 24 hours'
        ]
      }
    ]);
  };

  return (
    <div className="space-y-4 max-w-6xl mx-auto h-[calc(100vh-6.5rem)] flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-800 shrink-0">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-cyan-400" />
            AI Operations Intelligence Studio
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Evidence-grounded operational reasoning, telemetry correlation, and remediation drafting.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Model selector */}
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="px-2.5 py-1.5 rounded bg-slate-900 border border-slate-800 text-xs font-mono text-cyan-400 focus:outline-hidden"
          >
            <option value="gemini-2.5-flash">Gemini 2.5 Flash (Latency Optimized)</option>
            <option value="gemini-2.5-pro">Gemini 2.5 Pro (Deep RCA Reasoning)</option>
          </select>

          <button
            onClick={handleExportChat}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 text-xs font-medium transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Briefing</span>
          </button>

          <button
            onClick={handleResetChat}
            className="p-1.5 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
            title="Clear Chat History"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Chat Interface */}
      <div className="flex-1 min-h-0 bg-slate-900 border border-slate-800 rounded-lg flex flex-col overflow-hidden">
        {/* Messages Scroll Area */}
        <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-5 text-xs">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 max-w-4xl ${
                msg.sender === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
              }`}
            >
              {/* Avatar */}
              <div
                className={`w-7 h-7 rounded-md shrink-0 flex items-center justify-center font-bold text-xs ${
                  msg.sender === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gradient-to-br from-cyan-500 to-blue-700 text-white shadow-xs'
                }`}
              >
                {msg.sender === 'user' ? 'OP' : <Sparkles className="w-4 h-4" />}
              </div>

              {/* Message Bubble */}
              <div
                className={`rounded-lg p-4 space-y-3 leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-blue-600/90 text-white border border-blue-500/40 shadow-xs'
                    : 'bg-slate-950 border border-slate-800 text-slate-200 shadow-sm'
                }`}
              >
                <div className="flex items-center justify-between gap-4 text-[10px] font-mono opacity-70 border-b border-white/10 pb-1.5">
                  <span className="font-semibold uppercase">
                    {msg.sender === 'user' ? 'Operations Lead' : 'NexusOps AI Reasoning'}
                  </span>
                  <span>{new Date(msg.timestamp).toLocaleTimeString()}</span>
                </div>

                {/* Text Content */}
                <div className="whitespace-pre-wrap font-sans text-xs sm:text-[13px] leading-relaxed space-y-2">
                  {msg.content}
                </div>

                {/* Evidence citations */}
                {msg.evidenceCitations && msg.evidenceCitations.length > 0 && (
                  <div className="pt-2 border-t border-slate-800/80 space-y-1">
                    <span className="text-[10px] font-mono uppercase text-slate-400 font-semibold block">
                      Grounded Evidence Citations:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {msg.evidenceCitations.map((cit, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-cyan-300 font-mono text-[10px]"
                        >
                          📎 {cit}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Facts vs Hypotheses Breakdown */}
                {msg.factsVsHypothesisBreakdown && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-slate-800/80 text-[11px]">
                    <div className="p-2.5 rounded bg-slate-900/60 border border-emerald-900/40">
                      <div className="font-bold text-emerald-400 flex items-center gap-1 text-[10px] uppercase font-mono mb-1">
                        <CheckCircle2 className="w-3 h-3" /> Confirmed Facts
                      </div>
                      <ul className="space-y-1 text-slate-300">
                        {msg.factsVsHypothesisBreakdown.verifiedFacts.map((f, i) => (
                          <li key={i}>• {f}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-2.5 rounded bg-slate-900/60 border border-amber-900/40">
                      <div className="font-bold text-amber-400 flex items-center gap-1 text-[10px] uppercase font-mono mb-1">
                        <AlertTriangle className="w-3 h-3" /> Evaluated Hypotheses
                      </div>
                      <ul className="space-y-1 text-slate-300">
                        {msg.factsVsHypothesisBreakdown.hypotheses.map((h, i) => (
                          <li key={i}>• {h}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {/* Suggested follow ups */}
                {msg.suggestedFollowUps && msg.suggestedFollowUps.length > 0 && (
                  <div className="pt-2 border-t border-slate-800/60 flex flex-wrap gap-1.5">
                    {msg.suggestedFollowUps.map((prompt, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSendMessage(prompt)}
                        className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-cyan-300 text-[11px] transition-colors"
                      >
                        → {prompt}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {isGenerating && (
            <div className="flex gap-3 max-w-md">
              <div className="w-7 h-7 rounded-md bg-gradient-to-br from-cyan-500 to-blue-700 text-white flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4 animate-spin" />
              </div>
              <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-slate-400 flex items-center gap-2">
                <span>Correlating telemetry across PgBouncer, Aurora, and Canary logs...</span>
              </div>
            </div>
          )}

          <div ref={chatBottomRef} />
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-slate-950 border-t border-slate-800">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="Ask an operational inquiry (e.g. 'What is the blast radius on Order Processing?', 'Draft PIR report')..."
              className="flex-1 px-3.5 py-2 rounded-md bg-slate-900 border border-slate-800 text-slate-100 placeholder:text-slate-500 text-xs focus:outline-hidden focus:border-cyan-500"
            />
            <button
              type="submit"
              disabled={!inputQuery.trim() || isGenerating}
              className="px-4 py-2 rounded-md bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5 disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send</span>
            </button>
          </form>

          <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-400">
            <span>Grounding: Telemetry Logs & System Topology</span>
            <span className="font-mono">Ready for Gemini Backend Proxy</span>
          </div>
        </div>
      </div>
    </div>
  );
};
