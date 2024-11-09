import React, { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const PDFViewer = ({ pdfFile }) => {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  const goToNextPage = () => {
    setPageNumber((prevPage) => Math.min(prevPage + 1, numPages!));
  };

  const goToPrevPage = () => {
    setPageNumber((prevPage) => Math.max(prevPage - 1, 1));
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="max-w-2xl w-full p-4 bg-white shadow-lg rounded-lg">
        <Document file={pdfFile} onLoadSuccess={onDocumentLoadSuccess}>
          <Page pageNumber={pageNumber} />
        </Document>
        <div className="flex items-center justify-between mt-4">
          <button
            onClick={goToPrevPage}
            disabled={pageNumber === 1}
            className="px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed transition hover:bg-blue-600"
          >
            Previous
          </button>

          <span className="text-gray-700">
            Page {pageNumber} of {numPages}
          </span>

          <button
            onClick={goToNextPage}
            disabled={pageNumber === numPages}
            className="px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed transition hover:bg-blue-600"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default PDFViewer;
