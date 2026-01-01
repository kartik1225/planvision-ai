import type { Style } from '../../types';

interface StyleSelectorProps {
  styles: Style[];
  selectedStyleId: string | null;
  onSelect: (styleId: string) => void;
  isLoading: boolean;
}

export function StyleSelector({ styles, selectedStyleId, onSelect, isLoading }: StyleSelectorProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        <label className="block text-sm font-medium text-slate-300">Style</label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="aspect-square bg-white/5 border border-white/10 rounded-xl animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-slate-300">
        Style <span className="text-red-400">*</span>
      </label>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 max-h-80 overflow-y-auto p-1">
        {styles.map((style) => (
          <button
            key={style.id}
            type="button"
            onClick={() => onSelect(style.id)}
            className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all ${
              selectedStyleId === style.id
                ? 'border-purple-500 ring-2 ring-purple-500/30'
                : 'border-white/10 hover:border-purple-500/50'
            }`}
          >
            {/* Style thumbnail */}
            <img
              src={style.thumbnailUrl}
              alt={style.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://placehold.co/200x200/1e1b4b/a78bfa?text=Style';
              }}
            />

            {/* Name overlay */}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2">
              <span className="text-xs text-white font-medium line-clamp-1">
                {style.name}
              </span>
            </div>

            {/* Selected checkmark */}
            {selectedStyleId === style.id && (
              <div className="absolute top-2 right-2 w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
          </button>
        ))}
      </div>
      {!selectedStyleId && (
        <p className="text-xs text-slate-500">Select a style to apply to the thumbnail</p>
      )}
    </div>
  );
}
