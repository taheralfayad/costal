import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PDFViewer from './PDFViewer.js';
import { Title } from '../../design-system';


const TextbookView = () => {
  const { isbn } = useParams();
  const [textbook, setTextbook] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const handleBackToLibrary = () => {
    navigate(`/lti/textbook_list/${COURSE_ID}`);
  }

  useEffect(() => {
    const fetchTextbook = async () => {
      try {
        const response = await fetch(`/lti/api/textbooks/isbn/${isbn}/`);
        if (!response.ok) throw new Error('Failed to fetch textbook');
        const data = await response.json();
        setTextbook(data);
        console.log('Textbook data:', data);
        console.log(data);
      } catch (error) {
        console.error('Error fetching textbook:', error);
      } finally {
        setLoading(false);
        
      }
    };

    fetchTextbook();
  }, [isbn]);

  useEffect(() => {
    if (textbook) {
      console.log('Textbook data:', textbook);
      console.log('PDF URL:', textbook.pdf_url || textbook.file);
    }
  }, [textbook]);
  

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading textbook...</div>;
  }

  if (!textbook) {
    return <div className="p-8 text-center text-red-600">Textbook not found.</div>;
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center">
      <header className="w-full bg-emerald-400 text-white py-4 shadow-md">
        <div className="max-w-6xl mx-auto flex justify-between items-center px-6">
          <h1 className="text-ext-white text-xl font-semibold">Textbook Reader</h1>
          <nav>
            <a
              onClick={handleBackToLibrary}
              className="text-white text-sm font-medium hover:underline transition"
            >
              Back to Library
            </a>
          </nav>
        </div>
      </header>
      <main className="flex-grow w-full max-w-6xl mx-auto p-6">
        <div className="mb-6 text-center">
          <h2 className="text-3xl font-semibold text-black">{textbook.title}</h2>
          <p className="text-md text-gray-700">By {textbook.author}</p>
        </div>
        <div className="bg-green-50 border border-emerald-400 shadow-lg rounded-lg overflow-hidden h-1/2">
          <PDFViewer pdfFile={textbook.file} />
        </div>
      </main>
      <footer className="w-full bg-emerald-400 text-white py-4 text-center text-sm">
        © {new Date().getFullYear()} Textbook Reader. All rights reserved.
      </footer>
    </div>
  );
};

export default TextbookView;
