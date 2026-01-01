interface BeforeAfterPreviewProps {
  beforeUrl: string | null;
  afterUrl: string | null;
  isGenerating: boolean;
}

export function BeforeAfterPreview({ beforeUrl, afterUrl, isGenerating }: BeforeAfterPreviewProps) {
  if (!beforeUrl && !afterUrl && !isGenerating) {
    return null;
  }

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-slate-300">Preview Comparison</label>

      <div className="grid grid-cols-2 gap-4">
        {/* Before image */}
        <div className="space-y-2">
          <span className="text-xs text-slate-400 font-medium">Before (Original)</span>
          <div className="aspect-video bg-white/5 rounded-xl overflow-hidden border border-white/10">
            {beforeUrl ? (
              <img
                src={beforeUrl}
                alt="Before"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://placehold.co/400x300/1e1b4b/a78bfa?text=Before';
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-500">
                <span className="text-sm">No image uploaded</span>
              </div>
            )}
          </div>
        </div>

        {/* After image */}
        <div className="space-y-2">
          <span className="text-xs text-slate-400 font-medium">After (Generated)</span>
          <div className="aspect-video bg-white/5 rounded-xl overflow-hidden border border-white/10 relative">
            {isGenerating ? (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                <svg className="animate-spin h-8 w-8 mb-2" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span className="text-sm">Generating...</span>
                <span className="text-xs text-slate-500 mt-1">This may take 30-60 seconds</span>
              </div>
            ) : afterUrl ? (
              <img
                src={afterUrl}
                alt="After"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://placehold.co/400x300/1e1b4b/a78bfa?text=After';
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-500">
                <span className="text-sm">Click "Generate" to create</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Comparison arrows */}
      {beforeUrl && afterUrl && !isGenerating && (
        <div className="flex items-center justify-center gap-2 text-slate-400">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
          <span className="text-sm">AI Transformation</span>
        </div>
      )}
    </div>
  );
}
