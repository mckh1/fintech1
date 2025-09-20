import React, { useState, useCallback } from 'react';
import { fetchDefinition } from './services/geminiService';

// --- Helper Components (Defined outside the main App component) ---

const BookOpenIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
    />
  </svg>
);

const Header: React.FC = () => (
  <header className="flex items-center justify-center gap-3 p-4 border-b border-slate-700">
    <BookOpenIcon className="w-8 h-8 text-cyan-400" />
    <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
      AI 금융 용어 사전
    </h1>
  </header>
);

interface SearchFormProps {
  onSearch: (term: string) => void;
  isLoading: boolean;
}

const SearchForm: React.FC<SearchFormProps> = ({ onSearch, isLoading }) => {
  const [term, setTerm] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (term.trim() && !isLoading) {
      onSearch(term.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 w-full max-w-2xl mx-auto">
      <input
        type="text"
        value={term}
        onChange={(e) => setTerm(e.target.value)}
        placeholder="예: 핀테크, 양적완화..."
        className="flex-grow px-4 py-3 bg-slate-800 border border-slate-600 rounded-md focus:ring-2 focus:ring-cyan-500 focus:outline-none transition-shadow duration-200"
        disabled={isLoading}
      />
      <button
        type="submit"
        disabled={isLoading || !term.trim()}
        className="px-6 py-3 bg-cyan-600 text-white font-semibold rounded-md hover:bg-cyan-500 disabled:bg-slate-500 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center"
      >
        {isLoading ? '검색 중...' : '정의 찾기'}
      </button>
    </form>
  );
};

const LoadingSpinner: React.FC = () => (
    <div className="flex flex-col items-center justify-center gap-4 text-slate-400">
        <div className="w-12 h-12 border-4 border-t-cyan-400 border-slate-600 rounded-full animate-spin"></div>
        <p className="text-lg">AI가 용어를 분석하고 있습니다...</p>
    </div>
);


interface ResultDisplayProps {
  isLoading: boolean;
  error: string | null;
  definition: string | null;
}

const ResultDisplay: React.FC<ResultDisplayProps> = ({ isLoading, error, definition }) => {
  const renderContent = () => {
    if (isLoading) {
      return <LoadingSpinner />;
    }
    if (error) {
      return (
        <div className="text-center text-red-400">
          <h3 className="text-xl font-semibold mb-2">오류 발생</h3>
          <p>{error}</p>
        </div>
      );
    }
    if (definition) {
      return (
        <div className="w-full leading-relaxed">
          <p className="text-slate-300 text-left whitespace-pre-wrap">{definition}</p>
        </div>
      );
    }
    return (
      <div className="text-center text-slate-400">
        <BookOpenIcon className="w-16 h-16 mx-auto mb-4" />
        <h3 className="text-xl font-semibold">궁금한 금융 용어를 검색해보세요.</h3>
        <p>AI가 최신 정보를 바탕으로 알기 쉽게 설명해드립니다.</p>
      </div>
    );
  };

  return (
    <div className="w-full max-w-3xl mx-auto bg-slate-800/50 border border-slate-700 rounded-lg p-6 sm:p-8 mt-8 min-h-[300px] flex items-center justify-center transition-all duration-300">
        {renderContent()}
    </div>
  );
};

// --- Main App Component ---

const App: React.FC = () => {
  const [definition, setDefinition] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = useCallback(async (term: string) => {
    setIsLoading(true);
    setError(null);
    setDefinition(null);

    try {
      const result = await fetchDefinition(term);
      setDefinition(result);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('알 수 없는 오류가 발생했습니다. 다시 시도해주세요.');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans">
      <Header />
      <main className="container mx-auto p-4 sm:p-6">
        <div className="text-center my-8">
            <p className="text-lg text-slate-300 max-w-2xl mx-auto">
            최신 금융 단어를 입력하면 AI가 의미, 사용 예시, 그리고 쉬운 비유를 통해 자세히 설명해 드립니다.
            </p>
        </div>
        <SearchForm onSearch={handleSearch} isLoading={isLoading} />
        <ResultDisplay isLoading={isLoading} error={error} definition={definition} />
      </main>
      <footer className="text-center p-4 text-sm text-slate-500 mt-8">
        <p>Powered by Google Gemini</p>
      </footer>
    </div>
  );
};

export default App;