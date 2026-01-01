import { useState, useEffect } from 'react';
import { api } from '../services/api';
import type { PixabayImage } from '../types';

interface PixabayImagePickerProps {
  initialQuery?: string;
  selectedUrl: string | null;
  onSelect: (url: string | null) => void;
}

export function PixabayImagePicker({
  initialQuery = '',
  selectedUrl,
  onSelect,
}: PixabayImagePickerProps) {
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [images, setImages] = useState<PixabayImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalHits, setTotalHits] = useState(0);

  const handleSearch = async (query: string, pageNum = 1) => {
    if (!query.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const result = await api.searchPixabayImages({
        query: query.trim(),
        page: pageNum,
        perPage: 12,
        imageType: 'photo',
      });

      if (pageNum === 1) {
        setImages(result.hits);
      } else {
        setImages((prev) => [...prev, ...result.hits]);
      }
      setTotalHits(result.totalHits);
      setPage(pageNum);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search images');
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = () => {
    handleSearch(searchQuery, page + 1);
  };

  const toggleSelection = (image: PixabayImage) => {
    const url = image.largeImageURL;

    if (selectedUrl === url) {
      onSelect(null);
    } else {
      onSelect(url);
    }
  };

  const isSelected = (image: PixabayImage) => selectedUrl === image.largeImageURL;

  useEffect(() => {
    if (initialQuery && images.length === 0) {
      setSearchQuery(initialQuery);
      handleSearch(initialQuery, 1);
    }
  }, [initialQuery]);

  return (
    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
      <div className="mb-4">
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Search Source Images (Pixabay)
        </label>

        {/* Search Input */}
        <div className="flex gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch(searchQuery, 1)}
            placeholder="Search for source images..."
            className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <button
            type="button"
            onClick={() => handleSearch(searchQuery, 1)}
            disabled={loading || !searchQuery.trim()}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-600/50 text-white rounded-xl text-sm font-medium transition disabled:cursor-not-allowed"
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

      {/* Selected Indicator */}
      {selectedUrl && (
        <div className="mb-3 text-sm text-slate-400">
          <span className="text-emerald-400 font-medium">1 image selected</span> - click again to deselect
        </div>
      )}

      {/* Image Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-3 mb-4">
          {images.map((image) => (
            <button
              key={image.id}
              type="button"
              onClick={() => toggleSelection(image)}
              className={`relative aspect-video overflow-hidden rounded-xl border-2 transition-all cursor-pointer ${
                isSelected(image)
                  ? 'border-emerald-500 ring-2 ring-emerald-500/30'
                  : 'border-transparent hover:border-white/30'
              }`}
            >
              <img
                src={image.webformatURL}
                alt={image.tags || 'Stock photo'}
                className="w-full h-full object-cover"
              />
              {isSelected(image) && (
                <div className="absolute inset-0 bg-emerald-600/30 flex items-center justify-center">
                  <div className="bg-emerald-600 text-white rounded-full w-8 h-8 flex items-center justify-center">
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
                <p className="text-white text-xs truncate">{image.user}</p>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Load More */}
      {images.length > 0 && images.length < totalHits && (
        <button
          type="button"
          onClick={handleLoadMore}
          disabled={loading}
          className="w-full py-2 text-sm text-emerald-400 hover:text-emerald-300 font-medium disabled:opacity-50 transition"
        >
          {loading ? 'Loading...' : `Load More (${totalHits - images.length} remaining)`}
        </button>
      )}

      {/* No Results */}
      {!loading && images.length === 0 && searchQuery && (
        <div className="text-center py-8 text-slate-500">
          No images found. Try a different search term.
        </div>
      )}

      {/* Initial State */}
      {!loading && images.length === 0 && !searchQuery && (
        <div className="text-center py-8 text-slate-500">
          Enter a search term to find source images (16:9 landscape photos).
        </div>
      )}

      {/* Pixabay Attribution */}
      <div className="mt-3 text-xs text-slate-500 text-center">
        Photos provided by{' '}
        <a
          href="https://pixabay.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-slate-400 hover:text-emerald-400 underline transition"
        >
          Pixabay
        </a>
      </div>
    </div>
  );
}
