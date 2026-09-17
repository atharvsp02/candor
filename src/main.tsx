import './polyfills';
import { lazy, StrictMode, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/base.css';

const Landing = lazy(() => import('./site/Landing'));
const AppPage = lazy(() => import('./app/AppPage'));

const { pathname, search } = window.location;

if (pathname === '/' && new URLSearchParams(search).has('poll')) {
  window.history.replaceState({}, '', `/app${search}`);
}

const isApp = window.location.pathname.replace(/\/+$/, '') === '/app';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Suspense fallback={<div className="boot" />}>{isApp ? <AppPage /> : <Landing />}</Suspense>
  </StrictMode>,
);
