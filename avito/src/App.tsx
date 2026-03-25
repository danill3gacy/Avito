import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Header } from './components/Header';
import { AdsPage } from './pages/AdsPage';
import { AdViewPage } from './pages/AdViewPage';
import { AdEditPage } from './pages/AdEditPage';
import { useStore } from './store';
import './styles/global.css';

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000, retry: 1 } },
});

function AppContent() {
  const { theme } = useStore();
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <BrowserRouter>
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<Navigate to="/ads" replace />} />
          <Route path="/ads" element={<AdsPage />} />
          <Route path="/ads/:id" element={<AdViewPage />} />
          <Route path="/ads/:id/edit" element={<AdEditPage />} />
          <Route path="*" element={<Navigate to="/ads" replace />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}
