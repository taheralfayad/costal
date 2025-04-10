import React, { useState, useRef, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
import { Button } from '../../design-system';

const PDFViewer = ({ pdfFile }) => {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1);
  const pdfContainerRef = useRef(null);
  
  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };
  
  const goToNextPage = () => {
    setPageNumber((prevPage) => Math.min(prevPage + 1, numPages));
    setScale(1);
  };
  
  const goToPrevPage = () => {
    setPageNumber((prevPage) => Math.max(prevPage - 1, 1));
    setScale(1);
  };
  
  const zoomIn = () => {
    setScale((prevScale) => prevScale + 0.2);
  };
  
  const zoomOut = () => {
    setScale((prevScale) => Math.max(0.5, prevScale - 0.2));
  };
  
  useEffect(() => {
    if (pdfContainerRef.current) {
      const container = pdfContainerRef.current;
      const scrollToCenter = () => {
        const contentWidth = container.scrollWidth;
        const contentHeight = container.scrollHeight;
        const viewportWidth = container.clientWidth;
        const viewportHeight = container.clientHeight;
        
        container.scrollLeft = (contentWidth - viewportWidth) / 2;
        container.scrollTop = (contentHeight - viewportHeight) / 2;
      };
      
      const timerId = setTimeout(scrollToCenter, 100);
      return () => clearTimeout(timerId);
    }
  }, [scale]);
  
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <div className="max-w-3xl w-full p-4 bg-white shadow-lg rounded-lg">
        <div className="flex justify-center mb-4 gap-4">
          <Button
            disabled={scale <= 0.5}
            onClick={zoomOut}
            label='Zoom Out'
          >      
          </Button>
          <Button
            disabled={scale >= 2}
            onClick={zoomIn}
            label='Zoom In'
          >
          </Button>
        </div>
        
        <div
          ref={pdfContainerRef}
          className="overflow-auto"
          style={{ 
            maxHeight: '70vh', 
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'flex-start',
            padding: '20px'
          }}
        >
          <Document file={pdfFile} onLoadSuccess={onDocumentLoadSuccess}>
            <Page 
              pageNumber={pageNumber} 
              scale={scale} 
              renderTextLayer={false}
              renderAnnotationLayer={false}
            />
          </Document>
        </div>
        
        <div className="flex items-center justify-between mt-4">
          <Button
            onClick={goToPrevPage}
            disabled={pageNumber === 1}
            label='Previous'
          >   
          </Button>
          <span className="text-gray-700">
            Page {pageNumber} of {numPages || '--'}
          </span>
          <Button
            onClick={goToNextPage}
            disabled={pageNumber === numPages}
            label='Next'
          >
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PDFViewer;