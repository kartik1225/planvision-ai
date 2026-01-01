import { useState } from 'react';
import { api } from '../services/api';
import type { TemplateSuggestion } from '../types';

interface AIHelperProps {
  onSelectSuggestion: (suggestion: TemplateSuggestion) => void;
}

export function AIHelper({ onSelectSuggestion }: AIHelperProps) {
  const [description, setDescription] = useState('');
  const [suggestions, setSuggestions] = useState<TemplateSuggestion[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const handleGenerate = async () => {
    if (description.trim().length < 10) {
      setError('Please provide a more detailed description (at least 10 characters)');
      return;
    }

    setIsGenerating(true);
    setError('');
    setSuggestions([]);
    setSelectedIndex(null);

    try {
      const response = await api.suggestTemplates(description);
      setSuggestions(response.suggestions);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate suggestions');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelect = (index: number) => {
    setSelectedIndex(index);
    onSelectSuggestion(suggestions[index]);
  };

  return (
    <div className="mb-8 p-6 bg-gradient-to-r from-purple-900/30 to-indigo-900/30 border border-purple-500/30 rounded-2xl">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">AI Template Helper</h3>
          <p className="text-sm text-slate-400">Describe your template idea and let AI suggest the details</p>
        </div>
      </div>

      {/* Description Input */}
      <div className="mb-4">
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe what this template should be about... e.g., 'A cozy Scandinavian living room with natural light and minimalist furniture'"
          rows={3}
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition resize-none"
        />
      </div>

      {/* Generate Button */}
      <div className="flex gap-3 mb-4">
        <button
          type="button"
          onClick={handleGenerate}
          disabled={isGenerating || description.trim().length < 10}
          className="px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-600/50 text-white font-medium rounded-xl transition flex items-center gap-2"
        >
          {isGenerating ? (
            <>
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Generating...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Generate Suggestions
            </>
          )}
        </button>

        {suggestions.length > 0 && (
          <button
            type="button"
            onClick={handleGenerate}
            disabled={isGenerating}
            className="px-4 py-3 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl transition flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-xl text-red-200 text-sm">
          {error}
        </div>
      )}

      {/* Suggestions Grid */}
      {suggestions.length > 0 && (
        <div className="space-y-4">
          <p className="text-sm text-slate-400">
            Select a suggestion to populate the form:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {suggestions.map((suggestion, index) => (
              <div
                key={index}
                className={`relative p-4 bg-white/5 border rounded-xl transition cursor-pointer ${
                  selectedIndex === index
                    ? 'border-purple-500 bg-purple-500/10'
                    : 'border-white/10 hover:border-purple-500/50'
                }`}
                onClick={() => handleSelect(index)}
              >
                {/* Selection indicator */}
                {selectedIndex === index && (
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}

                {/* Variation number */}
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-2 py-1 bg-purple-600/30 text-purple-300 text-xs font-medium rounded-lg">
                    Option {index + 1}
                  </span>
                  <span className="text-xs text-slate-500">{suggestion.imageTypeLabel}</span>
                </div>

                {/* Title */}
                <h4 className="text-white font-medium mb-2 line-clamp-1">
                  {suggestion.title}
                </h4>

                {/* Description */}
                <p className="text-slate-400 text-sm mb-3 line-clamp-2">
                  {suggestion.description}
                </p>

              </div>
            ))}
          </div>
        </div>
      )}

      {/* Loading skeleton */}
      {isGenerating && (
        <div className="space-y-4">
          <p className="text-sm text-slate-400">Generating suggestions...</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-4 bg-white/5 border border-white/10 rounded-xl animate-pulse">
                <div className="h-4 bg-white/10 rounded w-20 mb-3"></div>
                <div className="h-5 bg-white/10 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-white/10 rounded w-full mb-1"></div>
                <div className="h-4 bg-white/10 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
