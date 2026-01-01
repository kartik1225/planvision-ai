import { useState } from 'react';
import { api } from '../services/api';
import type { StyleSuggestion } from '../types';

interface StyleThumbnailGeneratorProps {
  imageTypes: { id: string; label: string }[];
  generatedImageUrl: string | null;
  imageGenerationPrompt: string;
  onGeneratedImageChange: (url: string | null) => void;
  onStyleSuggestionSelect: (suggestion: StyleSuggestion) => void;
  onImagePromptChange: (prompt: string) => void;
  // Edit mode props - when editing, we skip the full AI flow
  isEditMode?: boolean;
  existingStyleName?: string;
  existingPromptFragment?: string;
  existingImageTypes?: string[]; // labels
}

export function StyleThumbnailGenerator({
  generatedImageUrl,
  imageGenerationPrompt,
  onGeneratedImageChange,
  onStyleSuggestionSelect,
  onImagePromptChange,
  isEditMode = false,
  existingStyleName,
  existingPromptFragment,
  existingImageTypes,
}: StyleThumbnailGeneratorProps) {
  const [description, setDescription] = useState('');
  const [suggestions, setSuggestions] = useState<StyleSuggestion[] | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastPromptUsed, setLastPromptUsed] = useState<string | null>(null);
  const [isBuildingPrompt, setIsBuildingPrompt] = useState(false);

  const handleSuggestStyles = async () => {
    if (!description.trim()) {
      setError('Please enter a style description');
      return;
    }

    setIsSuggesting(true);
    setError(null);
    setSuggestions(null);
    setSelectedIndex(null);

    try {
      const result = await api.suggestStylePrompts({
        description: description.trim(),
      });

      if (result.success && result.suggestions) {
        setSuggestions(result.suggestions);
      } else {
        setError(result.errorMessage || 'Failed to get suggestions');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get suggestions');
    } finally {
      setIsSuggesting(false);
    }
  };

  const handleSelectSuggestion = (index: number) => {
    if (!suggestions) return;

    setSelectedIndex(index);
    const selected = suggestions[index];
    onStyleSuggestionSelect(selected);
  };

  const handleGenerate = async () => {
    if (!imageGenerationPrompt.trim()) {
      setError('Image generation prompt is required');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const result = await api.generateStyleThumbnail({
        imagePrompt: imageGenerationPrompt.trim(),
      });

      if (result.success && result.generatedImageUrl) {
        onGeneratedImageChange(result.generatedImageUrl);
        setLastPromptUsed(result.promptUsed || imageGenerationPrompt);
      } else {
        setError(result.errorMessage || 'Generation failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate thumbnail');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleClear = () => {
    onGeneratedImageChange(null);
    setLastPromptUsed(null);
  };

  const handleReset = () => {
    setSuggestions(null);
    setSelectedIndex(null);
    setDescription('');
    onGeneratedImageChange(null);
    setLastPromptUsed(null);
  };

  const handleBuildImagePrompt = async () => {
    if (!existingStyleName || !existingPromptFragment) {
      setError('Style name and prompt fragment are required');
      return;
    }

    setIsBuildingPrompt(true);
    setError(null);

    try {
      const result = await api.buildImagePrompt({
        styleName: existingStyleName,
        promptFragment: existingPromptFragment,
        imageTypeLabels: existingImageTypes,
      });

      if (result.success && result.imagePrompt) {
        onImagePromptChange(result.imagePrompt);
      } else {
        setError(result.errorMessage || 'Failed to generate prompt');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate prompt');
    } finally {
      setIsBuildingPrompt(false);
    }
  };

  const canSuggest = description.trim() && !isSuggesting;
  const canGenerate = imageGenerationPrompt.trim() && !isGenerating;
  const canBuildPrompt = existingStyleName && existingPromptFragment && !isBuildingPrompt;

  // EDIT MODE: Simplified flow - generate prompt from existing data, then generate thumbnail
  if (isEditMode) {
    return (
      <div className="space-y-4 p-5 bg-gradient-to-r from-purple-900/30 to-pink-900/30 border border-purple-500/30 rounded-xl">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white">Regenerate Thumbnail</h4>
            <p className="text-xs text-slate-400">Generate a new thumbnail using existing style data</p>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="p-2.5 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-xs">
            {error}
          </div>
        )}

        {/* Step 1: Generate Image Prompt Button */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <label className="block text-xs font-medium text-slate-400">
                Step 1: Generate Image Prompt
              </label>
              <p className="text-xs text-slate-500 mt-0.5">
                AI will create a detailed prompt from: {existingStyleName || 'style name'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleBuildImagePrompt}
            disabled={!canBuildPrompt}
            className="w-full px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-600/50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition flex items-center justify-center gap-2"
          >
            {isBuildingPrompt ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Generating Prompt...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                Generate Image Prompt with AI
              </>
            )}
          </button>
        </div>

        {/* Step 2: Editable Image Generation Prompt */}
        <div className="pt-3 border-t border-white/10">
          <label className="block text-xs font-medium text-slate-400 mb-1.5">
            Step 2: Review & Edit Prompt
            <span className="text-slate-500 font-normal ml-1">(optional)</span>
          </label>
          <textarea
            value={imageGenerationPrompt}
            onChange={(e) => onImagePromptChange(e.target.value)}
            rows={5}
            disabled={isGenerating || isBuildingPrompt}
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition resize-none disabled:opacity-50"
            placeholder="Click 'Generate Image Prompt' above to create a detailed prompt from your style data..."
          />
        </div>

        {/* Step 3: Generate Thumbnail Button */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleGenerate}
            disabled={!canGenerate}
            className="flex-1 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-600/50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition flex items-center justify-center gap-2"
          >
            {isGenerating ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Generating Thumbnail...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Step 3: Generate Thumbnail
              </>
            )}
          </button>

          {generatedImageUrl && (
            <button
              type="button"
              onClick={handleClear}
              className="px-3 py-2.5 bg-white/10 hover:bg-white/20 text-white text-sm font-medium rounded-lg transition"
              title="Clear generated image"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Generated Preview */}
        {generatedImageUrl && (
          <div className="space-y-2">
            <div className="aspect-video rounded-lg overflow-hidden bg-white/5 ring-2 ring-green-500/50">
              <img
                src={generatedImageUrl}
                alt="Generated thumbnail"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://placehold.co/640x360?text=Error';
                }}
              />
            </div>
            <div className="flex items-center gap-2 text-xs text-green-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              New thumbnail generated - save to apply
            </div>
            {lastPromptUsed && (
              <details className="text-xs">
                <summary className="text-slate-400 cursor-pointer hover:text-slate-300">
                  View prompt used
                </summary>
                <p className="mt-1 p-2 bg-white/5 rounded text-slate-500 break-words">
                  {lastPromptUsed}
                </p>
              </details>
            )}
          </div>
        )}
      </div>
    );
  }

  // CREATE MODE: Full AI flow with 3 style options
  return (
    <div className="space-y-4 p-5 bg-gradient-to-r from-indigo-900/30 to-purple-900/30 border border-indigo-500/30 rounded-xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white">AI Style Generator</h4>
            <p className="text-xs text-slate-400">Get complete style suggestions from AI</p>
          </div>
        </div>
        {suggestions && (
          <button
            type="button"
            onClick={handleReset}
            className="text-xs text-slate-400 hover:text-white transition"
          >
            Start Over
          </button>
        )}
      </div>

      {/* Step 1: Description Input */}
      {!suggestions && (
        <>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">
              Describe Your Style Idea
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., Modern minimalist balcony with clean lines and natural materials"
              rows={3}
              maxLength={1000}
              disabled={isSuggesting}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition resize-none disabled:opacity-50"
            />
            <div className="flex items-center justify-between mt-1">
              <p className="text-xs text-slate-500">
                AI will generate 3 complete style options
              </p>
              <span className="text-xs text-slate-500">{description.length}/1000</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSuggestStyles}
            disabled={!canSuggest}
            className="w-full px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-600/50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition flex items-center justify-center gap-2"
          >
            {isSuggesting ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Generating Style Options...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                Generate Style Options
              </>
            )}
          </button>
        </>
      )}

      {/* Error Display */}
      {error && (
        <div className="p-2.5 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-xs">
          {error}
        </div>
      )}

      {/* Step 2: Style Selection Cards */}
      {suggestions && suggestions.length > 0 && (
        <div className="space-y-3">
          <label className="block text-xs font-medium text-slate-400">
            Choose a Style Option {selectedIndex !== null && `(Option ${selectedIndex + 1} selected)`}
          </label>
          <div className="space-y-3">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleSelectSuggestion(index)}
                disabled={isGenerating}
                className={`w-full text-left p-4 rounded-xl border transition ${
                  selectedIndex === index
                    ? 'bg-indigo-600/30 border-indigo-500 ring-1 ring-indigo-500'
                    : 'bg-white/5 border-white/10 hover:border-indigo-500/50 hover:bg-white/10'
                } ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className="space-y-2">
                  {/* Header with name and radio */}
                  <div className="flex items-start gap-3">
                    <div className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                      selectedIndex === index
                        ? 'border-indigo-500 bg-indigo-500'
                        : 'border-slate-500'
                    }`}>
                      {selectedIndex === index && (
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1">
                      <h5 className="text-sm font-semibold text-white">{suggestion.name}</h5>
                    </div>
                  </div>

                  {/* Prompt Fragment */}
                  <p className="text-xs text-slate-400 pl-8 leading-relaxed">
                    {suggestion.promptFragment}
                  </p>

                  {/* Suggested Image Types */}
                  {suggestion.suggestedImageTypes.length > 0 && (
                    <div className="pl-8 flex flex-wrap gap-1">
                      {suggestion.suggestedImageTypes.map((type, i) => (
                        <span
                          key={i}
                          className="inline-block px-2 py-0.5 bg-purple-600/30 text-purple-300 text-xs rounded-md"
                        >
                          {type}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 3: Editable Image Generation Prompt */}
      {selectedIndex !== null && suggestions && (
        <div className="space-y-3 pt-3 border-t border-white/10">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">
              Image Generation Prompt
              <span className="text-slate-500 font-normal ml-1">(edit if needed)</span>
            </label>
            <textarea
              value={imageGenerationPrompt}
              onChange={(e) => onImagePromptChange(e.target.value)}
              rows={4}
              disabled={isGenerating}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition resize-none disabled:opacity-50"
              placeholder="The AI-generated prompt will appear here. You can edit it before generating."
            />
            <p className="text-xs text-slate-500 mt-1">
              This prompt will be used to generate the style thumbnail image
            </p>
          </div>

          {/* Generate Button */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleGenerate}
              disabled={!canGenerate}
              className="flex-1 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-600/50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition flex items-center justify-center gap-2"
            >
              {isGenerating ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Generating Thumbnail...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Generate Thumbnail
                </>
              )}
            </button>

            {generatedImageUrl && (
              <button
                type="button"
                onClick={handleClear}
                className="px-3 py-2.5 bg-white/10 hover:bg-white/20 text-white text-sm font-medium rounded-lg transition"
                title="Clear generated image"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Generated Preview */}
      {generatedImageUrl && (
        <div className="space-y-2">
          <div className="aspect-video rounded-lg overflow-hidden bg-white/5 ring-2 ring-green-500/50">
            <img
              src={generatedImageUrl}
              alt="Generated thumbnail"
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://placehold.co/640x360?text=Error';
              }}
            />
          </div>
          <div className="flex items-center gap-2 text-xs text-green-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Thumbnail generated successfully
          </div>
          {lastPromptUsed && (
            <details className="text-xs">
              <summary className="text-slate-400 cursor-pointer hover:text-slate-300">
                View prompt used
              </summary>
              <p className="mt-1 p-2 bg-white/5 rounded text-slate-500 break-words">
                {lastPromptUsed}
              </p>
            </details>
          )}
        </div>
      )}
    </div>
  );
}
