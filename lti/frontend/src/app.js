import './App.css';
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import TextbookView from './components/TextbookView/TextbookView.js';
import TextbookList from './components/TextbookView/TextbookList.js';
import PDFViewer from './components/TextbookView/PDFViewer.js';

function App() {
  return (
      <Routes>
      <Route path="/list" element={<TextbookList />} />
      <Route path="/textbook/:isbn" 
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
 
