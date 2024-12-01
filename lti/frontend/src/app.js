import './App.css';
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import TextbookView from './components/TextbookView/TextbookView.tsx';
import TextbookList from './components/TextbookView/TextbookList.tsx';
import PDFViewer from './components/TextbookView/PDFViewer.tsx';

function App() {
  return (
      <Routes>
      <Route path="/list" element={<TextbookList />} />
      <Route path="/textbook/:id" 
             element={
             <TextbookView
             pdfFile="/sample.pdf"
             title="Introduction to Python Programming"
             author="Udayan Das" 
             />}
            />
        <Route
          path="/textbook"
          element={
            <PDFViewer pdfFile="/sample.pdf"/>
          }
        />
      </Routes>
  );
}

export default App;
 
