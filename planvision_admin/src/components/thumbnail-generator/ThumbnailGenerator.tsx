import { useState, useMemo, useEffect } from 'react';
import { api } from '../../services/api';
import type { Style, GenerationOptions } from '../../types';
import { StyleSelector } from './StyleSelector';
import { ColorPaletteSection } from './ColorPicker';
import { PerspectiveControls } from './PerspectiveControls';
import { BeforeAfterPreview } from './BeforeAfterPreview';

interface ThumbnailGeneratorProps {
  beforeImageUrl: string | null;
  generatedImageUrl: string | null;
  imageTypeId: string;
  styles: Style[];
  isLoadingStyles: boolean;
  onGeneratedImageChange: (url: string | null) => void;
  onGenerationOptionsChange: (options: GenerationOptions) => void;
}

export function ThumbnailGenerator({
  beforeImageUrl,
  generatedImageUrl,
  imageTypeId,
  styles,
  isLoadingStyles,
  onGeneratedImageChange,
  onGenerationOptionsChange,
}: ThumbnailGeneratorProps) {
  // Style selection
  const [selectedStyleId, setSelectedStyleId] = useState<string | null>(null);

  // Filter styles based on selected imageTypeId
  const filteredStyles = useMemo(() => {
    console.log('ThumbnailGenerator - imageTypeId:', imageTypeId);
    console.log('ThumbnailGenerator - styles count:', styles.length);
    console.log('ThumbnailGenerator - first style imageTypes:', styles[0]?.imageTypes);

    if (!imageTypeId) return styles;
    const filtered = styles.filter((style) => {
      // If style has no imageTypes, show it for all types (backwards compatible)
      if (!style.imageTypes || style.imageTypes.length === 0) return true;
      // Otherwise, check if the style supports this image type
      return style.imageTypes.some((it) => it.id === imageTypeId);
    });

    console.log('ThumbnailGenerator - filtered styles count:', filtered.length);
    return filtered;
  }, [styles, imageTypeId]);

  // Reset selected style if it's no longer in filtered list
  useEffect(() => {
    if (selectedStyleId && filteredStyles.length > 0) {
      const isStillValid = filteredStyles.some((s) => s.id === selectedStyleId);
      if (!isStillValid) {
        setSelectedStyleId(null);
      }
    }
  }, [filteredStyles, selectedStyleId]);

  // Color palette
  const [colorPrimary, setColorPrimary] = useState('');
  const [colorSecondary, setColorSecondary] = useState('');
  const [colorNeutral, setColorNeutral] = useState('');

  // Perspective
  const [perspectiveAngle, setPerspectiveAngle] = useState(45);
  const [perspectiveX, setPerspectiveX] = useState(50);
  const [perspectiveY, setPerspectiveY] = useState(50);

  // Custom instructions
  const [customInstructions, setCustomInstructions] = useState('');

  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Options panel expanded state
  const [isOptionsExpanded, setIsOptionsExpanded] = useState(false);

  const handleStyleSelect = (styleId: string) => {
    setSelectedStyleId(styleId);
    updateGenerationOptions({ styleId });
  };

  const updateGenerationOptions = (partial: Partial<GenerationOptions>) => {
    const options: GenerationOptions = {
      styleId: selectedStyleId || undefined,
      colorPrimaryHex: colorPrimary || undefined,
      colorSecondaryHex: colorSecondary || undefined,
      colorNeutralHex: colorNeutral || undefined,
      perspectiveAngle,
      perspectiveX,
      perspectiveY,
      customInstructions: customInstructions || undefined,
      ...partial,
    };
    onGenerationOptionsChange(options);
  };

  const handleGenerate = async () => {
    if (!beforeImageUrl) {
      setError('Please upload a source image first');
      return;
    }

    if (!selectedStyleId) {
      setError('Please select a style');
      return;
    }

    if (!imageTypeId) {
      setError('Please select an image type');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const result = await api.generateThumbnail({
        sourceImageUrl: beforeImageUrl,
        imageTypeId,
        styleId: selectedStyleId,
        colorPrimaryHex: colorPrimary || undefined,
        colorSecondaryHex: colorSecondary || undefined,
        colorNeutralHex: colorNeutral || undefined,
        perspectiveAngle,
        perspectiveX,
        perspectiveY,
        customInstructions: customInstructions || undefined,
      });

      if (result.success && result.generatedImageUrl) {
        onGeneratedImageChange(result.generatedImageUrl);
      } else {
        setError(result.errorMessage || 'Generation failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate thumbnail');
    } finally {
      setIsGenerating(false);
    }
  };

  const canGenerate = beforeImageUrl && selectedStyleId && imageTypeId && !isGenerating;

  return (
    <div className="space-y-6 p-6 bg-gradient-to-r from-indigo-900/30 to-purple-900/30 border border-indigo-500/30 rounded-2xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">Thumbnail Generator</h3>
          <p className="text-sm text-slate-400">Generate an AI preview of how the template will look</p>
        </div>
      </div>

      {/* Style Selector - filtered by image type */}
      <StyleSelector
        styles={filteredStyles}
        selectedStyleId={selectedStyleId}
        onSelect={handleStyleSelect}
        isLoading={isLoadingStyles}
      />

      {/* Show message if no styles match the selected image type */}
      {!isLoadingStyles && filteredStyles.length === 0 && imageTypeId && (
        <p className="text-sm text-amber-400">
          No styles available for this image type. Please select a different image type.
        </p>
      )}

      {/* Advanced Options Toggle */}
      <button
        type="button"
        onClick={() => setIsOptionsExpanded(!isOptionsExpanded)}
        className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition"
      >
        <svg
          className={`w-4 h-4 transition-transform ${isOptionsExpanded ? 'rotate-90' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        Advanced Options (Colors, Perspective, Instructions)
      </button>

      {/* Advanced Options Panel */}
      {isOptionsExpanded && (
        <div className="space-y-6 pl-6 border-l-2 border-white/10">
          {/* Color Palette */}
          <ColorPaletteSection
            primary={colorPrimary}
            secondary={colorSecondary}
            neutral={colorNeutral}
            onPrimaryChange={(hex) => {
              setColorPrimary(hex);
              updateGenerationOptions({ colorPrimaryHex: hex || undefined });
            }}
            onSecondaryChange={(hex) => {
              setColorSecondary(hex);
              updateGenerationOptions({ colorSecondaryHex: hex || undefined });
            }}
            onNeutralChange={(hex) => {
              setColorNeutral(hex);
              updateGenerationOptions({ colorNeutralHex: hex || undefined });
            }}
          />

          {/* Perspective Controls */}
          <PerspectiveControls
            angle={perspectiveAngle}
            x={perspectiveX}
            y={perspectiveY}
            onAngleChange={(angle) => {
              setPerspectiveAngle(angle);
              updateGenerationOptions({ perspectiveAngle: angle });
            }}
            onXChange={(x) => {
              setPerspectiveX(x);
              updateGenerationOptions({ perspectiveX: x });
            }}
            onYChange={(y) => {
              setPerspectiveY(y);
              updateGenerationOptions({ perspectiveY: y });
            }}
          />

          {/* Custom Instructions */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-300">Custom Instructions (Optional)</label>
            <textarea
              value={customInstructions}
              onChange={(e) => {
                setCustomInstructions(e.target.value);
                updateGenerationOptions({ customInstructions: e.target.value || undefined });
              }}
              placeholder="Add specific instructions for the AI, e.g., 'Focus on natural lighting' or 'Minimalist furniture'"
              rows={2}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition resize-none"
            />
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-xl text-red-200 text-sm">
          {error}
        </div>
      )}

      {/* Generate Button */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={handleGenerate}
          disabled={!canGenerate}
          className="flex-1 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-600/50 disabled:cursor-not-allowed text-white font-medium rounded-xl transition flex items-center justify-center gap-2"
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
              Generate Thumbnail
            </>
          )}
        </button>

        {generatedImageUrl && (
          <button
            type="button"
            onClick={() => onGeneratedImageChange(null)}
            className="px-4 py-3 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl transition"
          >
            Clear
          </button>
        )}
      </div>

      {/* Before/After Preview */}
      <BeforeAfterPreview
        beforeUrl={beforeImageUrl}
        afterUrl={generatedImageUrl}
        isGenerating={isGenerating}
      />

      {/* Help text */}
      {!beforeImageUrl && (
        <p className="text-sm text-slate-500 text-center">
          Upload a source image above to enable thumbnail generation
        </p>
      )}
    </div>
  );
}
