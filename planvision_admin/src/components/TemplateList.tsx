import { useState } from 'react';
import type { ProjectTemplate } from '../types';
import { ImageCompareSlider } from './ImageCompareSlider';

interface TemplateListProps {
  templates: ProjectTemplate[];
  isLoading: boolean;
  onDelete: (id: string) => Promise<void>;
}

export function TemplateList({ templates, isLoading, onDelete }: TemplateListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await onDelete(id);
    } finally {
      setDeletingId(null);
      setConfirmDeleteId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <svg className="animate-spin h-8 w-8 text-purple-500" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      </div>
    );
  }

  if (templates.length === 0) {
    return (
      <div className="text-center py-12 text-slate-400">
        <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
        <p>No templates yet. Create your first one!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {templates.map((template) => (
        <div
          key={template.id}
          className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-purple-500/50 transition group"
        >
          {/* Thumbnail - with compare slider if both original and generated exist */}
          {template.originalThumbnailUrl && template.generatedThumbnailUrl ? (
            <div className="relative">
              <ImageCompareSlider
                beforeUrl={template.originalThumbnailUrl}
                afterUrl={template.generatedThumbnailUrl}
              />
              <div className="absolute bottom-3 left-3 right-3 z-10 pointer-events-none">
                <span className="inline-block px-2 py-1 bg-purple-600/80 text-white text-xs font-medium rounded-lg">
                  {template.defaultImageType?.label || 'Unknown Type'}
                </span>
              </div>
            </div>
          ) : (
            <div className="aspect-video relative overflow-hidden">
              <img
                src={template.thumbnailUrl}
                alt={template.title}
                className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://placehold.co/400x225?text=No+Image';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-3 left-3 right-3">
                <span className="inline-block px-2 py-1 bg-purple-600/80 text-white text-xs font-medium rounded-lg">
                  {template.defaultImageType?.label || 'Unknown Type'}
                </span>
              </div>
            </div>
          )}

          {/* Content */}
          <div className="p-4">
            <h3 className="text-lg font-semibold text-white mb-2 truncate">
              {template.title}
            </h3>
            {template.description && (
              <p className="text-slate-400 text-sm line-clamp-2 mb-3">
                {template.description}
              </p>
            )}

            {/* Sample Images */}
            {template.sampleImageUrls.length > 0 && (
              <div className="mb-3">
                <p className="text-xs text-slate-500 mb-2">Sample Images:</p>
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {template.sampleImageUrls.map((url, index) => (
                    <div
                      key={index}
                      className="w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-white/5 border border-white/10"
                    >
                      <img
                        src={url}
                        alt={`Sample ${index + 1}`}
                        className="w-full h-full object-cover hover:scale-110 transition duration-200"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://placehold.co/64x64?text=Error';
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between text-xs text-slate-500 mb-3">
              <span>{template.sampleImageUrls.length} sample image(s)</span>
              <span>{new Date(template.createdAt).toLocaleDateString()}</span>
            </div>

            {/* Delete Button */}
            {confirmDeleteId === template.id ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDelete(template.id)}
                  disabled={deletingId === template.id}
                  className="flex-1 px-3 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-800 text-white text-sm font-medium rounded-lg transition flex items-center justify-center gap-2"
                >
                  {deletingId === template.id ? (
                    <>
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Deleting...
                    </>
                  ) : (
                    'Confirm Delete'
                  )}
                </button>
                <button
                  onClick={() => setConfirmDeleteId(null)}
                  disabled={deletingId === template.id}
                  className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white text-sm font-medium rounded-lg transition"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmDeleteId(template.id)}
                className="w-full px-3 py-2 bg-white/5 hover:bg-red-600/20 border border-white/10 hover:border-red-500/50 text-slate-400 hover:text-red-400 text-sm font-medium rounded-lg transition flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete Template
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
