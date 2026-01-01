import { useState, useRef } from 'react';
import type { ImageType, CreateTemplateDto, TemplateSuggestion, Style, GenerationOptions } from '../types';
import { api } from '../services/api';
import { AIHelper } from './AIHelper';
import { ThumbnailGenerator } from './thumbnail-generator';
import { PexelsImagePicker } from './PexelsImagePicker';
import { PixabayImagePicker } from './PixabayImagePicker';

interface TemplateFormProps {
  imageTypes: ImageType[];
  styles: Style[];
  isLoadingStyles: boolean;
  onSubmit: (data: CreateTemplateDto) => Promise<void>;
  isSubmitting: boolean;
}

// Group image types by category
const groupImageTypes = (types: ImageType[]) => {
  const groups: Record<string, ImageType[]> = {
    'Floor Plans': [],
    'Interior - Living': [],
    'Interior - Utility': [],
    'Interior - Recreation': [],
    'Interior - Other': [],
    'Commercial': [],
    'Exterior': [],
    'Other': [],
  };

  types.forEach((type) => {
    if (type.value.startsWith('floor_plan') || type.value === 'sketch_drawing') {
      groups['Floor Plans'].push(type);
    } else if (['interior_living_room', 'interior_bedroom', 'interior_dining_room', 'interior_office'].includes(type.value)) {
      groups['Interior - Living'].push(type);
    } else if (['interior_kitchen', 'interior_bathroom', 'interior_laundry_room', 'interior_walkin_closet'].includes(type.value)) {
      groups['Interior - Utility'].push(type);
    } else if (['interior_home_gym', 'interior_media_room', 'interior_game_room', 'interior_sunroom'].includes(type.value)) {
      groups['Interior - Recreation'].push(type);
    } else if (type.value.startsWith('interior_')) {
      groups['Interior - Other'].push(type);
    } else if (type.value.startsWith('commercial_')) {
      groups['Commercial'].push(type);
    } else if (type.value.startsWith('exterior_')) {
      groups['Exterior'].push(type);
    } else {
      groups['Other'].push(type);
    }
  });

  return Object.entries(groups).filter(([, items]) => items.length > 0);
};

export function TemplateForm({ imageTypes, styles, isLoadingStyles, onSubmit, isSubmitting }: TemplateFormProps) {
  // Basic form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [thumbnailInputMode, setThumbnailInputMode] = useState<'url' | 'upload' | 'pixabay'>('pixabay');
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [sampleUrls, setSampleUrls] = useState<string[]>(['']);
  const [sampleInputModes, setSampleInputModes] = useState<('url' | 'upload')[]>(['upload']);
  const [uploadingSampleIndex, setUploadingSampleIndex] = useState<number | null>(null);
  const [draggingSampleIndex, setDraggingSampleIndex] = useState<number | null>(null);
  const sampleFileInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [imageTypeId, setImageTypeId] = useState('');
  const [error, setError] = useState('');

  // New thumbnail generation state
  const [generatedThumbnailUrl, setGeneratedThumbnailUrl] = useState<string | null>(null);
  const [generationOptions, setGenerationOptions] = useState<GenerationOptions | null>(null);

  // Pexels image picker state
  const [suggestedKeywords, setSuggestedKeywords] = useState<string[]>([]);
  const [sampleImageMode, setSampleImageMode] = useState<'pexels' | 'manual'>('pexels');
  const [pexelsSelectedUrls, setPexelsSelectedUrls] = useState<string[]>([]);

  const groupedTypes = groupImageTypes(imageTypes);

  const addSampleUrl = () => {
    if (sampleUrls.length < 5) {
      setSampleUrls([...sampleUrls, '']);
      setSampleInputModes([...sampleInputModes, 'upload']);
    }
  };

  const removeSampleUrl = (index: number) => {
    setSampleUrls(sampleUrls.filter((_, i) => i !== index));
    setSampleInputModes(sampleInputModes.filter((_, i) => i !== index));
  };

  const updateSampleUrl = (index: number, value: string) => {
    const updated = [...sampleUrls];
    updated[index] = value;
    setSampleUrls(updated);
  };

  const updateSampleInputMode = (index: number, mode: 'url' | 'upload') => {
    const updated = [...sampleInputModes];
    updated[index] = mode;
    setSampleInputModes(updated);
  };

  const handleSampleFileUpload = async (file: File, index: number) => {
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }

    setUploadingSampleIndex(index);
    setError('');
    try {
      const result = await api.uploadTemplateAsset(file);
      updateSampleUrl(index, result.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploadingSampleIndex(null);
    }
  };

  const handleSampleDrop = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDraggingSampleIndex(null);
    const file = e.dataTransfer.files[0];
    if (file) {
      handleSampleFileUpload(file, index);
    }
  };

  const handleSampleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDraggingSampleIndex(index);
  };

  const handleSampleDragLeave = () => {
    setDraggingSampleIndex(null);
  };

  const handleSampleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (file) {
      handleSampleFileUpload(file, index);
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
      // Clear generated thumbnail when source changes
      setGeneratedThumbnailUrl(null);
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

  const handleSuggestionSelect = (suggestion: TemplateSuggestion) => {
    setTitle(suggestion.title);
    setDescription(suggestion.description);
    setImageTypeId(suggestion.imageTypeId);
    // Reset sample URLs and thumbnails - user will add manually
    setSampleUrls(['']);
    setSampleInputModes(['upload']);
    setThumbnailUrl('');
    setGeneratedThumbnailUrl(null);
    setGenerationOptions(null);
    setError('');
    // Set suggested keywords for Pexels image picker
    setSuggestedKeywords(suggestion.sampleImageKeywords || []);
    setPexelsSelectedUrls([]);
    setSampleImageMode('pexels');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Title is required');
      return;
    }
    if (!thumbnailUrl.trim()) {
      setError('Source thumbnail URL is required');
      return;
    }
    if (!imageTypeId) {
      setError('Please select an image type');
      return;
    }

    // Get sample URLs from either Pexels picker or manual input
    const validSampleUrls = sampleImageMode === 'pexels'
      ? pexelsSelectedUrls
      : sampleUrls.filter((url) => url.trim());
    if (validSampleUrls.length === 0) {
      setError('At least one sample image is required');
      return;
    }

    try {
      // Determine which thumbnail to use as the main display thumbnail
      const displayThumbnail = generatedThumbnailUrl || thumbnailUrl.trim();

      await onSubmit({
        title: title.trim(),
        description: description.trim() || undefined,
        thumbnailUrl: displayThumbnail,
        originalThumbnailUrl: thumbnailUrl.trim() || undefined,
        generatedThumbnailUrl: generatedThumbnailUrl || undefined,
        sampleImageUrls: validSampleUrls,
        defaultImageTypeId: imageTypeId,
        defaultStyleId: generationOptions?.styleId,
        generationOptions: generationOptions || undefined,
      });

      // Reset form on success
      setTitle('');
      setDescription('');
      setThumbnailUrl('');
      setGeneratedThumbnailUrl(null);
      setGenerationOptions(null);
      setSampleUrls(['']);
      setSampleInputModes(['upload']);
      setImageTypeId('');
      setSuggestedKeywords([]);
      setPexelsSelectedUrls([]);
      setSampleImageMode('pexels');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create template');
    }
  };

  return (
    <div className="space-y-6">
      {/* AI Helper */}
      <AIHelper onSelectSuggestion={handleSuggestionSelect} />

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-200">
            {error}
          </div>
        )}

        {/* Section 1: Basic Info */}
        <div className="p-6 bg-white/5 border border-white/10 rounded-2xl space-y-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <span className="w-6 h-6 bg-purple-600 rounded-lg flex items-center justify-center text-sm">1</span>
            Basic Information
          </h3>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={255}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
              placeholder="e.g., Modern Home Office"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition resize-none"
              placeholder="A compelling description for the template card..."
            />
          </div>
        </div>

        {/* Section 2: Source Image & Thumbnail Generation */}
        <div className="p-6 bg-white/5 border border-white/10 rounded-2xl space-y-6">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <span className="w-6 h-6 bg-purple-600 rounded-lg flex items-center justify-center text-sm">2</span>
            Source Image & AI Generation
          </h3>

          {/* Image Type Selector - placed first to filter styles */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Image Type <span className="text-red-400">*</span>
            </label>
            <p className="text-xs text-slate-500 mb-3">What type of image is this? This helps filter available styles.</p>
            <select
              value={imageTypeId}
              onChange={(e) => {
                setImageTypeId(e.target.value);
                // Clear generated thumbnail when image type changes (styles may be different)
                setGeneratedThumbnailUrl(null);
                setGenerationOptions(null);
              }}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
            >
              <option value="" className="bg-slate-800">Select an image type...</option>
              {groupedTypes.map(([group, types]) => (
                <optgroup key={group} label={group} className="bg-slate-800">
                  {types.map((type) => (
                    <option key={type.id} value={type.id} className="bg-slate-800">
                      {type.label}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          {/* Source Image Upload */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-slate-300">
                Source Image (Before) <span className="text-red-400">*</span>
              </label>
              <div className="flex gap-1 bg-white/5 rounded-lg p-1">
                <button
                  type="button"
                  onClick={() => setThumbnailInputMode('pixabay')}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition flex items-center gap-1 ${
                    thumbnailInputMode === 'pixabay'
                      ? 'bg-emerald-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Stock
                </button>
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
              </div>
            </div>

            {thumbnailInputMode === 'pixabay' ? (
              <PixabayImagePicker
                initialQuery=""
                selectedUrl={thumbnailUrl || null}
                onSelect={(url) => {
                  setThumbnailUrl(url || '');
                  setGeneratedThumbnailUrl(null);
                }}
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
                      <p className="text-sm text-white truncate">Source image uploaded</p>
                      <p className="text-xs text-slate-500 truncate">{thumbnailUrl}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setThumbnailUrl('');
                        setGeneratedThumbnailUrl(null);
                      }}
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
                  onChange={(e) => {
                    setThumbnailUrl(e.target.value);
                    setGeneratedThumbnailUrl(null);
                  }}
                  className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                  placeholder="https://images.unsplash.com/..."
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

          {/* Thumbnail Generator */}
          <ThumbnailGenerator
            beforeImageUrl={thumbnailUrl || null}
            generatedImageUrl={generatedThumbnailUrl}
            imageTypeId={imageTypeId}
            styles={styles}
            isLoadingStyles={isLoadingStyles}
            onGeneratedImageChange={setGeneratedThumbnailUrl}
            onGenerationOptionsChange={setGenerationOptions}
          />
        </div>

        {/* Section 3: Sample Images */}
        <div className="p-6 bg-white/5 border border-white/10 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <span className="w-6 h-6 bg-purple-600 rounded-lg flex items-center justify-center text-sm">3</span>
              Sample Images
            </h3>
            <div className="flex gap-1 bg-white/5 rounded-lg p-1">
              <button
                type="button"
                onClick={() => setSampleImageMode('pexels')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition flex items-center gap-1.5 ${
                  sampleImageMode === 'pexels'
                    ? 'bg-purple-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Stock Photos
              </button>
              <button
                type="button"
                onClick={() => setSampleImageMode('manual')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition flex items-center gap-1.5 ${
                  sampleImageMode === 'manual'
                    ? 'bg-purple-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                Upload
              </button>
            </div>
          </div>
          <p className="text-xs text-slate-500">
            {sampleImageMode === 'pexels'
              ? 'Search and select stock photos from Pexels to use as sample images.'
              : 'Upload your own images or provide URLs for sample images.'}
          </p>

          {sampleImageMode === 'pexels' ? (
            <PexelsImagePicker
              suggestedKeywords={suggestedKeywords}
              selectedUrls={pexelsSelectedUrls}
              onSelect={setPexelsSelectedUrls}
              maxSelections={5}
            />
          ) : (
            <div className="space-y-4">
              {sampleUrls.map((url, index) => (
                <div key={index} className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-300">Sample Image {index + 1}</span>
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1 bg-white/5 rounded-lg p-1">
                        <button
                          type="button"
                          onClick={() => updateSampleInputMode(index, 'upload')}
                          className={`px-2 py-1 text-xs font-medium rounded-md transition ${
                            sampleInputModes[index] === 'upload'
                              ? 'bg-purple-600 text-white'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          Upload
                        </button>
                        <button
                          type="button"
                          onClick={() => updateSampleInputMode(index, 'url')}
                          className={`px-2 py-1 text-xs font-medium rounded-md transition ${
                            sampleInputModes[index] === 'url'
                              ? 'bg-purple-600 text-white'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          URL
                        </button>
                      </div>
                      {sampleUrls.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeSampleUrl(index)}
                          className="p-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg transition"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>

                  {sampleInputModes[index] === 'upload' ? (
                    <div className="space-y-3">
                      {/* Drop zone */}
                      {!url ? (
                        <div
                          onDrop={(e) => handleSampleDrop(e, index)}
                          onDragOver={(e) => handleSampleDragOver(e, index)}
                          onDragLeave={handleSampleDragLeave}
                          onClick={() => sampleFileInputRefs.current[index]?.click()}
                          className={`relative border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition ${
                            draggingSampleIndex === index
                              ? 'border-purple-500 bg-purple-500/10'
                              : 'border-white/20 hover:border-purple-500/50 hover:bg-white/5'
                          } ${uploadingSampleIndex === index ? 'pointer-events-none opacity-50' : ''}`}
                        >
                          <input
                            ref={(el) => { sampleFileInputRefs.current[index] = el; }}
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleSampleFileSelect(e, index)}
                            className="hidden"
                          />
                          {uploadingSampleIndex === index ? (
                            <div className="flex flex-col items-center gap-2">
                              <svg className="animate-spin h-6 w-6 text-purple-500" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                              </svg>
                              <span className="text-slate-400 text-sm">Uploading...</span>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center gap-1">
                              <svg className="w-8 h-8 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              <span className="text-slate-400 text-xs">
                                Drop or <span className="text-purple-400">click to upload</span>
                              </span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center gap-3 p-2 bg-white/5 rounded-xl">
                          <div className="w-14 h-14 rounded-lg overflow-hidden bg-white/10 flex-shrink-0">
                            <img
                              src={url}
                              alt={`Sample ${index + 1}`}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://placehold.co/56x56?text=Error';
                              }}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-white truncate">Image uploaded</p>
                            <p className="text-xs text-slate-500 truncate">{url}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => updateSampleUrl(index, '')}
                            className="p-2 text-slate-400 hover:text-red-400 transition"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex gap-3">
                      <input
                        type="url"
                        value={url}
                        onChange={(e) => updateSampleUrl(index, e.target.value)}
                        className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                        placeholder="https://images.unsplash.com/..."
                      />
                      {url && (
                        <div className="w-14 h-14 rounded-lg overflow-hidden bg-white/5 flex-shrink-0">
                          <img
                            src={url}
                            alt={`Sample ${index + 1}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://placehold.co/56x56?text=Error';
                            }}
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
              {sampleUrls.length < 5 && (
                <button
                  type="button"
                  onClick={addSampleUrl}
                  className="w-full py-3 border-2 border-dashed border-white/20 hover:border-purple-500/50 text-slate-400 hover:text-purple-400 rounded-xl transition flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Another Sample Image
                </button>
              )}
            </div>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-4 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-600/50 text-white font-semibold rounded-xl transition duration-200 flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Creating...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create Template
            </>
          )}
        </button>
      </form>
    </div>
  );
}
