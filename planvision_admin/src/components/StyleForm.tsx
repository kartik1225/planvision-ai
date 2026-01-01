import { useState, useRef, useEffect } from 'react';
import type { ImageType, CreateStyleDto, Style, UpdateStyleDto, StyleSuggestion } from '../types';
import { api } from '../services/api';
import { StyleThumbnailGenerator } from './StyleThumbnailGenerator';

interface StyleFormProps {
  imageTypes: ImageType[];
  onSubmit: (data: CreateStyleDto) => Promise<void>;
  onUpdate?: (id: string, data: UpdateStyleDto) => Promise<void>;
  isSubmitting: boolean;
  editingStyle?: Style | null;
  onCancelEdit?: () => void;
}

export function StyleForm({ imageTypes, onSubmit, onUpdate, isSubmitting, editingStyle, onCancelEdit }: StyleFormProps) {
  const isEditMode = !!editingStyle;

  const [name, setName] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [thumbnailInputMode, setThumbnailInputMode] = useState<'url' | 'upload' | 'generate'>('upload');
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [promptFragment, setPromptFragment] = useState('');
  const [selectedImageTypeIds, setSelectedImageTypeIds] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [generatedThumbnailUrl, setGeneratedThumbnailUrl] = useState<string | null>(null);
  const [imageGenerationPrompt, setImageGenerationPrompt] = useState('');

  // Populate form when editing
  useEffect(() => {
    if (editingStyle) {
      setName(editingStyle.name);
      setThumbnailUrl(editingStyle.thumbnailUrl);
      setPromptFragment(editingStyle.promptFragment || '');
      setSelectedImageTypeIds(editingStyle.imageTypes?.map(t => t.id) || []);
      setThumbnailInputMode('upload'); // Default to upload mode when editing
      setGeneratedThumbnailUrl(null);
      setImageGenerationPrompt('');
      setError('');
    } else {
      // Reset form when not editing
      setName('');
      setThumbnailUrl('');
      setPromptFragment('');
      setSelectedImageTypeIds([]);
      setThumbnailInputMode('upload');
      setGeneratedThumbnailUrl(null);
      setImageGenerationPrompt('');
      setError('');
    }
  }, [editingStyle]);

  // Handle when user selects a complete style suggestion from AI
  const handleStyleSuggestionSelect = (suggestion: StyleSuggestion) => {
    setName(suggestion.name);
    setPromptFragment(suggestion.promptFragment);
    setImageGenerationPrompt(suggestion.imageGenerationPrompt);

    // Map suggested image type labels to IDs
    const matchedIds = suggestion.suggestedImageTypes
      .map((label) => imageTypes.find((t) => t.label.toLowerCase() === label.toLowerCase())?.id)
      .filter((id): id is string => id !== undefined);
    setSelectedImageTypeIds(matchedIds);
  };

  const handleImageTypeToggle = (id: string) => {
    setSelectedImageTypeIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedImageTypeIds.length === imageTypes.length) {
      setSelectedImageTypeIds([]);
    } else {
      setSelectedImageTypeIds(imageTypes.map((t) => t.id));
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }

    setIsUploading(true);
    setError('');
    try {
      const result = await api.uploadTemplateAsset(file);
      setThumbnailUrl(result.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Name is required');
      return;
    }

    // Determine the final thumbnail URL
    const finalThumbnailUrl = thumbnailInputMode === 'generate'
      ? generatedThumbnailUrl
      : thumbnailUrl.trim();

    if (!finalThumbnailUrl) {
      setError('Thumbnail is required - please upload, provide a URL, or generate one');
      return;
    }
    if (!promptFragment.trim()) {
      setError('Prompt fragment is required');
      return;
    }

    try {
      if (isEditMode && editingStyle && onUpdate) {
        // Update existing style
        await onUpdate(editingStyle.id, {
          name: name.trim(),
          thumbnailUrl: finalThumbnailUrl,
          promptFragment: promptFragment.trim(),
          imageTypeIds: selectedImageTypeIds.length > 0 ? selectedImageTypeIds : undefined,
        });
      } else {
        // Create new style
        await onSubmit({
          name: name.trim(),
          thumbnailUrl: finalThumbnailUrl,
          promptFragment: promptFragment.trim(),
          imageTypeIds: selectedImageTypeIds.length > 0 ? selectedImageTypeIds : undefined,
        });

        // Reset form on success (only for create mode)
        setName('');
        setThumbnailUrl('');
        setGeneratedThumbnailUrl(null);
        setPromptFragment('');
        setSelectedImageTypeIds([]);
        setImageGenerationPrompt('');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : isEditMode ? 'Failed to update style' : 'Failed to create style');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-200">
          {error}
        </div>
      )}

      {/* Name */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Name <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={255}
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
          placeholder="e.g., Modern Minimalist"
        />
      </div>

      {/* Thumbnail */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-slate-300">
            Thumbnail <span className="text-red-400">*</span>
          </label>
          <div className="flex gap-1 bg-white/5 rounded-lg p-1">
            <button
              type="button"
              onClick={() => setThumbnailInputMode('upload')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition ${
                thumbnailInputMode === 'upload'
                  ? 'bg-purple-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Upload
            </button>
            <button
              type="button"
              onClick={() => setThumbnailInputMode('url')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition ${
                thumbnailInputMode === 'url'
                  ? 'bg-purple-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              URL
            </button>
            <button
              type="button"
              onClick={() => setThumbnailInputMode('generate')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition ${
                thumbnailInputMode === 'generate'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              AI Generate
            </button>
          </div>
        </div>

        {thumbnailInputMode === 'generate' ? (
          <StyleThumbnailGenerator
            imageTypes={imageTypes}
            generatedImageUrl={generatedThumbnailUrl}
            imageGenerationPrompt={imageGenerationPrompt}
            onGeneratedImageChange={setGeneratedThumbnailUrl}
            onStyleSuggestionSelect={handleStyleSuggestionSelect}
            onImagePromptChange={setImageGenerationPrompt}
            // Edit mode: pass existing data for prompt building
            isEditMode={isEditMode}
            existingStyleName={name}
            existingPromptFragment={promptFragment}
            existingImageTypes={selectedImageTypeIds
              .map(id => imageTypes.find(t => t.id === id)?.label)
              .filter((label): label is string => !!label)}
          />
        ) : thumbnailInputMode === 'upload' ? (
          <div className="space-y-3">
            {/* Drop zone */}
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
              className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition ${
                isDragging
                  ? 'border-purple-500 bg-purple-500/10'
                  : 'border-white/20 hover:border-purple-500/50 hover:bg-white/5'
              } ${isUploading ? 'pointer-events-none opacity-50' : ''}`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              {isUploading ? (
                <div className="flex flex-col items-center gap-2">
                  <svg className="animate-spin h-8 w-8 text-purple-500" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span className="text-slate-400 text-sm">Uploading...</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <svg className="w-10 h-10 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-slate-400 text-sm">
                    Drop image here or <span className="text-purple-400">click to browse</span>
                  </span>
                  <span className="text-slate-500 text-xs">PNG, JPG, WebP up to 10MB</span>
                </div>
              )}
            </div>

            {/* Preview if uploaded */}
            {thumbnailUrl && (
              <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-white/10 flex-shrink-0">
                  <img
                    src={thumbnailUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://placehold.co/64x64?text=Error';
                    }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">Thumbnail uploaded</p>
                  <p className="text-xs text-slate-500 truncate">{thumbnailUrl}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setThumbnailUrl('')}
                  className="p-2 text-slate-400 hover:text-red-400 transition"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex gap-4">
            <input
              type="url"
              value={thumbnailUrl}
              onChange={(e) => setThumbnailUrl(e.target.value)}
              className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
              placeholder="https://example.com/style-thumbnail.jpg"
            />
            {thumbnailUrl && (
              <div className="w-20 h-20 rounded-xl overflow-hidden bg-white/5 flex-shrink-0">
                <img
                  src={thumbnailUrl}
                  alt="Preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://placehold.co/80x80?text=Error';
                  }}
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Prompt Fragment */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Prompt Fragment <span className="text-red-400">*</span>
        </label>
        <p className="text-xs text-slate-500 mb-2">
          This text is sent to the AI when this style is selected. Describe the design aesthetic.
        </p>
        <textarea
          value={promptFragment}
          onChange={(e) => setPromptFragment(e.target.value)}
          rows={4}
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition resize-none"
          placeholder="e.g., Clean lines, neutral color palette with white and gray tones, natural materials like wood and stone, minimal furniture with functional design..."
        />
      </div>

      {/* Image Types */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-slate-300">
            Applicable Image Types
          </label>
          <button
            type="button"
            onClick={handleSelectAll}
            className="text-xs text-purple-400 hover:text-purple-300 transition"
          >
            {selectedImageTypeIds.length === imageTypes.length ? 'Deselect All' : 'Select All'}
          </button>
        </div>
        <p className="text-xs text-slate-500 mb-3">
          Select which image types this style can be applied to. If none selected, the style will be available for all types.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-64 overflow-y-auto p-3 bg-white/5 border border-white/10 rounded-xl">
          {imageTypes.map((type) => (
            <label
              key={type.id}
              className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition ${
                selectedImageTypeIds.includes(type.id)
                  ? 'bg-purple-600/30 border border-purple-500/50'
                  : 'bg-white/5 border border-transparent hover:bg-white/10'
              }`}
            >
              <input
                type="checkbox"
                checked={selectedImageTypeIds.includes(type.id)}
                onChange={() => handleImageTypeToggle(type.id)}
                className="w-4 h-4 rounded border-white/20 bg-white/5 text-purple-600 focus:ring-purple-500 focus:ring-offset-0"
              />
              <span className="text-sm text-white truncate">{type.label}</span>
            </label>
          ))}
        </div>
        {selectedImageTypeIds.length > 0 && (
          <p className="text-xs text-slate-400 mt-2">
            {selectedImageTypeIds.length} type(s) selected
          </p>
        )}
      </div>

      {/* Action Buttons */}
      <div className={`flex gap-3 ${isEditMode ? 'pt-4 border-t border-white/10' : ''}`}>
        {isEditMode && onCancelEdit && (
          <button
            type="button"
            onClick={onCancelEdit}
            className="flex-1 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium rounded-xl transition"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className={`${isEditMode ? 'flex-1' : 'w-full'} py-4 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-600/50 text-white font-semibold rounded-xl transition duration-200 flex items-center justify-center gap-2`}
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              {isEditMode ? 'Saving...' : 'Creating...'}
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isEditMode ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                )}
              </svg>
              {isEditMode ? 'Save Changes' : 'Create Style'}
            </>
          )}
        </button>
      </div>
    </form>
  );
}
