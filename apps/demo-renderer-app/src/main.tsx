import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import type { DefaultOptions } from '@tanstack/react-query';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '@/styles/globals.css';

const DEFAULT_QUERY_OPTIONS: DefaultOptions = {
  queries: {
    refetchOnWindowFocus: false,
    keepPreviousData: true
  }
};

const queryClient = new QueryClient({ defaultOptions: DEFAULT_QUERY_OPTIONS });

ReactDOM.createRoot(document.getElementById('root')!).render(
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>
);
