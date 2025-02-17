import React from 'react';
import PDFViewer from './PDFViewer.js';

// TODO: Change the hardcoded data to call from the API endpoint TextbookViewSet.get_by_isbn(isbn) instead.
const TextbookView = ({ pdfFile, title, author }) => {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center">
      <header className="w-full bg-green-700 text-white py-4 shadow-md">
        <div className="max-w-6xl mx-auto flex justify-between items-center px-6">
          <h1 className="text-2xl font-bold">Textbook Reader</h1>
          <nav>
            <a
              href="/list"
              className="text-white text-sm font-medium hover:underline transition"
            >
              Back to Library
            </a>
          </nav>
        </div>
      </header>
      <main className="flex-grow w-full max-w-6xl mx-auto p-6">
        <div className="mb-6 text-center">
          <h2 className="text-3xl font-semibold text-black">{title}</h2>
          <p className="text-md text-gray-700">By {author}</p>
        </div>
        <div className="bg-green-50 border border-green-700 shadow-lg rounded-lg overflow-hidden h-1/2">
          <PDFViewer pdfFile={pdfFile} />
        </div>
      </main>
      <footer className="w-full bg-green-700 text-white py-4 text-center text-sm">
        © {new Date().getFullYear()} Textbook Reader. All rights reserved.
      </footer>
    </div>
  );
};

export default TextbookView;