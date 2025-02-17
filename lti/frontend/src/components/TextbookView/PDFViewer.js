import React, { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const PDFViewer = ({ pdfFile }) => {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  const goToNextPage = () => {
    setPageNumber((prevPage) => Math.min(prevPage + 1, numPages));
  };

  const goToPrevPage = () => {
    setPageNumber((prevPage) => Math.max(prevPage - 1, 1));
  };

  const zoomIn = () => {
    setScale((prevScale) => prevScale + 0.2);
  };

  const zoomOut = () => {
    setScale((prevScale) => Math.max(1, prevScale - 0.2));
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <div className="max-w-3xl w-full p-4 bg-white shadow-lg rounded-lg">
        <div className="flex justify-center mb-4 gap-4">
          <button
            onClick={zoomOut}
            className="px-2 py-1 bg-blue-500 text-white font-semibold rounded-lg mr-2 transition hover:bg-blue-600"
          >
            Zoom Out
          </button>
          <button
            onClick={zoomIn}
            className="px-2 py-1 bg-blue-500 text-white font-semibold rounded-lg transition hover:bg-blue-600"
          >
            Zoom In
          </button>
        </div>
        <div
          className="overflow-auto flex justify-center"
          style={{ maxHeight: '70vh', maxWidth: '100%' }}
        >
          <Document file={pdfFile} onLoadSuccess={onDocumentLoadSuccess}>
            <Page pageNumber={pageNumber} scale={scale} />
          </Document>
        </div>
        <div className="flex items-center justify-between mt-4">
          <button
            onClick={goToPrevPage}
            disabled={pageNumber === 1}
            className="px-4 py-2 bg-green-500 text-white font-semibold rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed transition hover:bg-green-600"
          >
            Previous
          </button>

          <span className="text-gray-700">
            Page {pageNumber} of {numPages}
          </span>

          <button
            onClick={goToNextPage}
            disabled={pageNumber === numPages}
            className="px-4 py-2 bg-green-500 text-white font-semibold rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed transition hover:bg-green-600"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default PDFViewer;
