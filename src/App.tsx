import { RoastForm } from './components/RoastForm';
import { RoastDisplay } from './components/RoastDisplay';
import { useRoastGenerator } from './hooks/useRoastGenerator';

function App() {
  const { roast, name, profile, isLoading, isParsingPDF, error, generateFromPDF, generateFromText, reset } = useRoastGenerator();

  const handleSubmitPDF = (pdfFile: File) => {
    generateFromPDF(pdfFile);
  };

  const handleSubmitText = (text: string) => {
    generateFromText(text);
  };

  const handleRoastAgain = () => {
    reset();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <header className="pt-8 pb-4 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <span className="text-4xl">🔥</span>
          <h1 className="text-4xl md:text-5xl font-bold text-gradient">
            Roast My LinkedIn
          </h1>
          <span className="text-4xl">🔥</span>
        </div>
        <p className="text-gray-400 text-lg">
          Upload your profile PDF. Get brutally roasted. Share the pain.
        </p>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Form or Display */}
        {!roast && !isLoading && !error ? (
          <RoastForm
            onSubmitPDF={handleSubmitPDF}
            onSubmitText={handleSubmitText}
            isLoading={isLoading}
            isParsingPDF={isParsingPDF}
          />
        ) : (
          <>
            <RoastDisplay
              roast={roast}
              name={name}
              profile={profile}
              isLoading={isLoading}
              isParsingPDF={isParsingPDF}
              error={error}
              onRoastAgain={handleRoastAgain}
            />
            {!isLoading && !error && (
              <div className="mt-8 text-center">
                <button
                  onClick={handleRoastAgain}
                  className="text-gray-500 hover:text-gray-300 transition-colors underline"
                >
                  Try with a different profile
                </button>
              </div>
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="py-8 text-center text-gray-600 text-sm">
        <div className="flex items-center justify-center mb-3">
          <a
            href="https://akash.network"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block hover:opacity-80 transition-opacity"
          >
            <img src="/powered-by-akash.svg" alt="Powered by Akash" className="h-6" />
          </a>
        </div>
        <p>
          Powered by{' '}
          <a
            href="https://akashml.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-flame-orange hover:underline"
          >
            AkashML
          </a>
          {' '}& DeepSeek AI
        </p>
        <p className="mt-2 text-gray-700">
          No LinkedIn accounts were harmed in the making of this app.
        </p>
      </footer>
    </div>
  );
}

export default App;
