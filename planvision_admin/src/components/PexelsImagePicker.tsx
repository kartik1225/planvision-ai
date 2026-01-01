import { useState, useEffect } from 'react';
import { api } from '../services/api';
import type { PexelsPhoto } from '../types';

interface PexelsImagePickerProps {
  suggestedKeywords: string[];
  selectedUrls: string[];
  onSelect: (urls: string[]) => void;
  maxSelections?: number;
}

export function PexelsImagePicker({
  suggestedKeywords,
  selectedUrls,
  onSelect,
  maxSelections = 5,
}: PexelsImagePickerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [photos, setPhotos] = useState<PexelsPhoto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);

  const handleSearch = async (query: string, pageNum = 1) => {
    if (!query.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const result = await api.searchPexelsImages({
        query: query.trim(),
        page: pageNum,
        perPage: 12,
        orientation: 'landscape',
      });

      if (pageNum === 1) {
        setPhotos(result.photos);
      } else {
        setPhotos((prev) => [...prev, ...result.photos]);
      }
      setTotalResults(result.totalResults);
      setPage(pageNum);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search images');
    } finally {
      setLoading(false);
    }
  };

  const handleKeywordClick = (keyword: string) => {
    setSearchQuery(keyword);
    handleSearch(keyword, 1);
  };

  const handleLoadMore = () => {
    handleSearch(searchQuery, page + 1);
  };

  const toggleSelection = (photo: PexelsPhoto) => {
    const url = photo.src.large;

    if (selectedUrls.includes(url)) {
      onSelect(selectedUrls.filter((u) => u !== url));
    } else if (selectedUrls.length < maxSelections) {
      onSelect([...selectedUrls, url]);
    }
  };

  const isSelected = (photo: PexelsPhoto) => selectedUrls.includes(photo.src.large);

  useEffect(() => {
    if (suggestedKeywords.length > 0 && photos.length === 0) {
      const firstKeyword = suggestedKeywords[0];
      setSearchQuery(firstKeyword);
      handleSearch(firstKeyword, 1);
    }
  }, [suggestedKeywords]);

  return (
    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
      <div className="mb-4">
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Search Stock Photos (Pexels)
        </label>

        {/* Suggested Keywords */}
        {suggestedKeywords.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {suggestedKeywords.map((keyword, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleKeywordClick(keyword)}
                className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                  searchQuery === keyword
                    ? 'bg-purple-600/30 border-purple-500 text-purple-300'
                    : 'bg-white/5 border-white/20 text-slate-400 hover:bg-white/10 hover:text-white'
                }`}
              >
                {keyword}
              </button>
            ))}
          </div>
        )}

        {/* Search Input */}
        <div className="flex gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch(searchQuery, 1)}
            placeholder="Search for images..."
            className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <button
            type="button"
            onClick={() => handleSearch(searchQuery, 1)}
            disabled={loading || !searchQuery.trim()}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-600/50 text-white rounded-xl text-sm font-medium transition disabled:cursor-not-allowed"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-xl text-red-300 text-sm">
          {error}
        </div>
      )}

      {/* Selected Count */}
      {selectedUrls.length > 0 && (
        <div className="mb-3 text-sm text-slate-400">
          Selected: <span className="text-purple-400 font-medium">{selectedUrls.length}</span> / {maxSelections} images
        </div>
      )}

      {/* Photo Grid */}
      {photos.length > 0 && (
        <div className="grid grid-cols-3 gap-3 mb-4">
          {photos.map((photo) => (
            <button
              key={photo.id}
              type="button"
              onClick={() => toggleSelection(photo)}
              className={`relative aspect-video overflow-hidden rounded-xl border-2 transition-all ${
                isSelected(photo)
                  ? 'border-purple-500 ring-2 ring-purple-500/30'
                  : 'border-transparent hover:border-white/30'
              } ${
                selectedUrls.length >= maxSelections && !isSelected(photo)
                  ? 'opacity-40 cursor-not-allowed'
                  : 'cursor-pointer'
              }`}
              disabled={selectedUrls.length >= maxSelections && !isSelected(photo)}
            >
              <img
                src={photo.src.medium}
                alt={photo.alt || 'Stock photo'}
                className="w-full h-full object-cover"
              />
              {isSelected(photo) && (
                <div className="absolute inset-0 bg-purple-600/30 flex items-center justify-center">
                  <div className="bg-purple-600 text-white rounded-full w-8 h-8 flex items-center justify-center">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                </div>
              )}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                <p className="text-white text-xs truncate">{photo.photographer}</p>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Load More */}
      {photos.length > 0 && photos.length < totalResults && (
        <button
          type="button"
          onClick={handleLoadMore}
          disabled={loading}
          className="w-full py-2 text-sm text-purple-400 hover:text-purple-300 font-medium disabled:opacity-50 transition"
        >
          {loading ? 'Loading...' : `Load More (${totalResults - photos.length} remaining)`}
        </button>
      )}

      {/* No Results */}
      {!loading && photos.length === 0 && searchQuery && (
        <div className="text-center py-8 text-slate-500">
          No images found. Try a different search term.
        </div>
      )}

      {/* Initial State */}
      {!loading && photos.length === 0 && !searchQuery && suggestedKeywords.length === 0 && (
        <div className="text-center py-8 text-slate-500">
          Enter a search term or use suggested keywords to find images.
        </div>
      )}

      {/* Pexels Attribution */}
      <div className="mt-3 text-xs text-slate-500 text-center">
        Photos provided by{' '}
        <a
          href="https://www.pexels.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-slate-400 hover:text-purple-400 underline transition"
        >
          Pexels
        </a>
      </div>
    </div>
  );
}
