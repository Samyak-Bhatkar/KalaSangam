import React from 'react';
import ReactDOM from 'react-dom/client';
import GenomeApp from './GenomeApp';
import './genome.css';

const rootElement = document.getElementById('genome-root');

if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <GenomeApp />
    </React.StrictMode>
  );
} else {
  console.error("Failed to find #genome-root element to mount Cultural Genome App.");
}
