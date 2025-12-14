import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import ErrorBoundary from './components/ErrorBoundary';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

try {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </React.StrictMode>
  );
} catch (e) {
  console.error("Failed to initialize app:", e);
  rootElement.innerHTML = `
    <div style="height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;color:#ef4444;direction:rtl;text-align:center;padding:20px;font-family:sans-serif;">
      <h2 style="font-size:20px;margin-bottom:10px;">فشل بدء التطبيق</h2>
      <p style="font-size:14px;color:#374151;">حدث خطأ أثناء تحميل الملفات الأساسية.</p>
      <code style="display:block;margin-top:20px;background:#f3f4f6;padding:10px;border-radius:8px;text-align:left;direction:ltr;">${e instanceof Error ? e.message : String(e)}</code>
    </div>
  `;
}