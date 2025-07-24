import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import type { DefaultOptions } from '@tanstack/react-query';
import { keepPreviousData, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '@/styles/globals.css';

const DEFAULT_QUERY_OPTIONS: DefaultOptions = {
  queries: {
    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData
  }
};

const queryClient = new QueryClient({ defaultOptions: DEFAULT_QUERY_OPTIONS });

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
ReactDOM.createRoot(document.getElementById('root')!).render(
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>
);
