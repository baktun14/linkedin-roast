import { useState, useRef } from 'react';

type InputMode = 'pdf' | 'text';

interface RoastFormProps {
  onSubmitPDF: (file: File) => void;
  onSubmitText: (text: string) => void;
  isLoading: boolean;
  isParsingPDF: boolean;
}

const PLACEHOLDER_TEXT = `Paste your LinkedIn profile content here. You can copy from:
- The PDF you downloaded
- Your LinkedIn "About" section
- Any text from your profile page`;

const MIN_TEXT_CHARS = 50;
const MAX_TEXT_CHARS = 3000;

export function RoastForm({ onSubmitPDF, onSubmitText, isLoading, isParsingPDF }: RoastFormProps) {
  const [mode, setMode] = useState<InputMode>('pdf');
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [text, setText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const textCharCount = text.length;
  const isTextValid = textCharCount >= MIN_TEXT_CHARS && textCharCount <= MAX_TEXT_CHARS;
  const isPdfValid = pdfFile !== null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    if (mode === 'pdf' && isPdfValid) {
      onSubmitPDF(pdfFile);
    } else if (mode === 'text' && isTextValid) {
      onSubmitText(text);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setPdfFile(file);
    }
  };

  const handleDropZoneClick = () => {
    fileInputRef.current?.click();
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files[0];
    if (file && file.type === 'application/pdf') {
      setPdfFile(file);
    }
  };

  const getLoadingText = () => {
    if (isParsingPDF) return 'Parsing your profile...';
    return 'Cooking up your roast...';
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
      {/* Mode Toggle */}
      <div className="flex mb-6 bg-gray-900 rounded-lg p-1">
        <button
          type="button"
          onClick={() => setMode('pdf')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            mode === 'pdf'
              ? 'bg-flame-orange text-white'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Upload PDF
        </button>
        <button
          type="button"
          onClick={() => setMode('text')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            mode === 'text'
              ? 'bg-flame-orange text-white'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Paste Text
        </button>
      </div>

      {/* PDF Upload Mode */}
      {mode === 'pdf' && (
        <div>
          {/* Instructions */}
          <div className="mb-4 p-4 bg-gray-900/50 border border-gray-800 rounded-lg">
            <h3 className="text-sm font-semibold text-gray-300 mb-2">How to get your LinkedIn PDF:</h3>
            <ol className="text-sm text-gray-500 space-y-1">
              <li>1. Go to your LinkedIn profile</li>
              <li>2. Click the <span className="text-gray-300">"More"</span> button below your profile photo</li>
              <li>3. Select <span className="text-gray-300">"Save to PDF"</span></li>
              <li>4. Upload the downloaded PDF below</li>
            </ol>
          </div>

          {/* Drop Zone */}
          <div
            onClick={handleDropZoneClick}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className={`w-full p-8 border-2 border-dashed rounded-xl text-center cursor-pointer transition-colors ${
              pdfFile
                ? 'border-flame-orange bg-flame-orange/10'
                : 'border-gray-700 hover:border-gray-500 bg-gray-900'
            } ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,application/pdf"
              onChange={handleFileChange}
              disabled={isLoading}
              className="hidden"
            />

            {pdfFile ? (
              <div className="space-y-2">
                <div className="text-4xl">📄</div>
                <p className="text-white font-medium">{pdfFile.name}</p>
                <p className="text-sm text-gray-400">
                  {(pdfFile.size / 1024).toFixed(1)} KB
                </p>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setPdfFile(null);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                  className="text-sm text-flame-red hover:underline"
                >
                  Remove
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="text-4xl">📤</div>
                <p className="text-gray-300">Drop your LinkedIn PDF here</p>
                <p className="text-sm text-gray-500">or click to browse</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Text Input Mode */}
      {mode === 'text' && (
        <div className="relative">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={PLACEHOLDER_TEXT}
            disabled={isLoading}
            className="w-full h-48 p-4 bg-gray-900 border-2 border-gray-700 rounded-xl text-white placeholder-gray-500 focus:border-flame-orange focus:outline-none resize-none transition-colors disabled:opacity-50"
            maxLength={MAX_TEXT_CHARS}
          />
          <div className="absolute bottom-3 right-3 text-sm text-gray-500">
            <span className={textCharCount < MIN_TEXT_CHARS ? 'text-flame-red' : 'text-gray-400'}>
              {textCharCount}
            </span>
            <span className="text-gray-600">/{MAX_TEXT_CHARS}</span>
          </div>
          {textCharCount > 0 && textCharCount < MIN_TEXT_CHARS && (
            <p className="mt-2 text-sm text-flame-red">
              Need at least {MIN_TEXT_CHARS - textCharCount} more characters
            </p>
          )}
        </div>
      )}

      {/* Submit Button */}
      <div className="mt-6 text-center">
        <button
          type="submit"
          disabled={(mode === 'pdf' && !isPdfValid) || (mode === 'text' && !isTextValid) || isLoading}
          className="px-8 py-4 bg-gradient-to-r from-flame-orange to-flame-red text-white font-bold text-lg rounded-xl hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed shadow-lg shadow-flame-red/20"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              {getLoadingText()}
            </span>
          ) : (
            'Roast Me!'
          )}
        </button>
      </div>

      {/* Mode hint */}
      {mode === 'pdf' && (
        <p className="mt-4 text-center text-sm text-gray-500">
          Don't have the PDF?{' '}
          <button
            type="button"
            onClick={() => setMode('text')}
            className="text-flame-orange hover:underline"
          >
            Paste your profile text instead
          </button>
        </p>
      )}
      {mode === 'text' && (
        <p className="mt-4 text-center text-sm text-gray-500">
          Have a LinkedIn PDF?{' '}
          <button
            type="button"
            onClick={() => setMode('pdf')}
            className="text-flame-orange hover:underline"
          >
            Upload it for better results
          </button>
        </p>
      )}
    </form>
  );
}
