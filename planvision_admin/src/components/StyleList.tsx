import { useState, useEffect } from 'react';
import type { Style, ImageType, UpdateStyleDto } from '../types';
import { StyleForm } from './StyleForm';

interface StyleListProps {
  styles: Style[];
  imageTypes: ImageType[];
  isLoading: boolean;
  onDelete: (id: string) => Promise<void>;
  onUpdate: (id: string, data: UpdateStyleDto) => Promise<void>;
  isSubmitting: boolean;
}

export function StyleList({ styles, imageTypes, isLoading, onDelete, onUpdate, isSubmitting }: StyleListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [editingStyle, setEditingStyle] = useState<Style | null>(null);

  // Close modal on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && editingStyle) {
        setEditingStyle(null);
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [editingStyle]);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await onDelete(id);
    } finally {
      setDeletingId(null);
      setConfirmDeleteId(null);
    }
  };

  const handleUpdate = async (id: string, data: UpdateStyleDto) => {
    await onUpdate(id, data);
    setEditingStyle(null);
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

  if (styles.length === 0) {
    return (
      <div className="text-center py-12 text-slate-400">
        <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
        </svg>
        <p>No styles yet. Create your first one!</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {styles.map((style) => (
          <div
            key={style.id}
            className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-purple-500/50 transition group"
          >
            {/* Thumbnail */}
            <div className="aspect-video relative overflow-hidden">
              <img
                src={style.thumbnailUrl}
                alt={style.name}
                className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://placehold.co/400x225?text=No+Image';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

              {/* Edit Button Overlay */}
              <button
                onClick={() => setEditingStyle(style)}
                className="absolute top-3 right-3 p-2 bg-black/50 hover:bg-purple-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition"
                title="Edit Style"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="p-4">
              <h3 className="text-lg font-semibold text-white mb-2 truncate">
                {style.name}
              </h3>

              {/* Prompt Fragment Preview */}
              {style.promptFragment && (
                <p className="text-slate-400 text-sm line-clamp-2 mb-3">
                  {style.promptFragment}
                </p>
              )}

              {/* Image Types */}
              {style.imageTypes && style.imageTypes.length > 0 ? (
                <div className="mb-3">
                  <p className="text-xs text-slate-500 mb-2">Applies to:</p>
                  <div className="flex flex-wrap gap-1">
                    {style.imageTypes.slice(0, 3).map((type) => (
                      <span
                        key={type.id}
                        className="inline-block px-2 py-1 bg-purple-600/30 text-purple-300 text-xs font-medium rounded-lg"
                      >
                        {type.label}
                      </span>
                    ))}
                    {style.imageTypes.length > 3 && (
                      <span className="inline-block px-2 py-1 bg-white/10 text-slate-400 text-xs font-medium rounded-lg">
                        +{style.imageTypes.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                <div className="mb-3">
                  <span className="inline-block px-2 py-1 bg-green-600/30 text-green-300 text-xs font-medium rounded-lg">
                    All image types
                  </span>
                </div>
              )}

              {/* Metadata */}
              <div className="flex items-center justify-between text-xs text-slate-500 mb-3">
                <span>{style.imageTypes?.length || 0} type(s)</span>
                {style.createdAt && (
                  <span>{new Date(style.createdAt).toLocaleDateString()}</span>
                )}
              </div>

              {/* Action Buttons */}
              {confirmDeleteId === style.id ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDelete(style.id)}
                    disabled={deletingId === style.id}
                    className="flex-1 px-3 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-800 text-white text-sm font-medium rounded-lg transition flex items-center justify-center gap-2"
                  >
                    {deletingId === style.id ? (
                      <>
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Deleting...
                      </>
                    ) : (
                      'Confirm'
                    )}
                  </button>
                  <button
                    onClick={() => setConfirmDeleteId(null)}
                    disabled={deletingId === style.id}
                    className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white text-sm font-medium rounded-lg transition"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setEditingStyle(style)}
                    className="flex-1 px-3 py-2 bg-purple-600/20 hover:bg-purple-600/40 border border-purple-500/30 hover:border-purple-500/50 text-purple-300 hover:text-purple-200 text-sm font-medium rounded-lg transition flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit
                  </button>
                  <button
                    onClick={() => setConfirmDeleteId(style.id)}
                    className="px-3 py-2 bg-white/5 hover:bg-red-600/20 border border-white/10 hover:border-red-500/50 text-slate-400 hover:text-red-400 text-sm font-medium rounded-lg transition"
                    title="Delete Style"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      {editingStyle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setEditingStyle(null)}
          />

          {/* Modal */}
          <div className="relative bg-slate-900 border border-white/10 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-slate-900 border-b border-white/10 px-6 py-4 flex items-center justify-between z-10">
              <h2 className="text-xl font-semibold text-white">Edit Style</h2>
              <button
                onClick={() => setEditingStyle(null)}
                className="p-2 text-slate-400 hover:text-white transition rounded-lg hover:bg-white/10"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Form */}
            <div className="p-6">
              <StyleForm
                imageTypes={imageTypes}
                onSubmit={async () => {}} // Not used in edit mode
                onUpdate={handleUpdate}
                isSubmitting={isSubmitting}
                editingStyle={editingStyle}
                onCancelEdit={() => setEditingStyle(null)}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
