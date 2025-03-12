import React, { useState, useEffect } from 'react';
import Editor from 'quill-editor-math'
import 'quill-editor-math/dist/index.css'
import './RichTextEditor.css';

const RichTextEditor = ({ label = 'Rich Text Editor', value, onChange, placeholder = 'Type here' }) => {
  const [wordCount, setWordCount] = React.useState(0);
  const customOperator = [
    ['\\pm', '\\pm'],
    ['\\sqrt{x}', '\\sqrt'],
    ['\\sqrt[3]{x}', '\\sqrt[3]{}'],
    ['\\sqrt[n]{x}', '\\nthroot'],
    ['\\frac{x}{y}', '\\frac'],
    ['\\sum^{s}_{x}{d}', '\\sum'],
    ['\\prod^{s}_{x}{d}', '\\prod'],
    ['\\coprod^{s}_{x}{d}', '\\coprod'],
    ['\\int^{s}_{x}{d}', '\\int'],
    ['\\binom{n}{k}', '\\binom'],

    ['a^{b}', '^{'],
    ['x_{n}', '_'],
    ['x^{n}', '^'],
    ['\\log{x}', '\\log'],
    ['\\ln{x}', '\\ln'],
    ['\\log_{b}{x}', '\\log_b'],

    ['\\sin{x}', '\\sin'],
    ['\\cos{x}', '\\cos'],
    ['\\tan{x}', '\\tan'],
    ['\\csc{x}', '\\csc'],
    ['\\sec{x}', '\\sec'],
    ['\\cot{x}', '\\cot'],

    ['\\arcsin{x}', '\\arcsin'],
    ['\\arccos{x}', '\\arccos'],
    ['\\arctan{x}', '\\arctan'],

    ['\\lim_{x \\to a}', '\\lim'],

    ['\\frac{d}{dx}', '\\frac{d}{dx}'],
    ['\\frac{d^{2}}{dx^{2}}', '\\frac{d^{2}}{dx^{2}}'],

    ['\\int_{a}^{b}', '\\int'],
    ['\\int_{a}^{\\infty}', '\\int'],

    ['\\sum_{n=1}^{\\infty}', '\\sum'],
    ['\\prod_{n=1}^{\\infty}', '\\prod'],
    ['\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}', '\\begin{pmatrix}'],
    ['\\det{A}', '\\det'],

    ['|x|', '\\left|x\\right|'],

    ['x^{1/2}', '\\sqrt'],
    ['x^{1/3}', '\\sqrt[3]{}'],
    ['i', 'i'],
    ['\\in', '\\in'],
    ['\\subset', '\\subset'],
    ['\\cup', '\\cup'],
    ['\\cap', '\\cap'],
    ['\\lim_{x \\to \\infty}', '\\lim_{x \\to \\infty}'],
    ['\\lim_{x \\to -\\infty}', '\\lim_{x \\to -\\infty}']
  ];


  const calculateWordCount = (text) => {
    const plainText = text.replace(/<\/?[^>]+(>|$)/g, '');
    const words = plainText.trim().split(/\s+/);
    return words[0] === '' ? 0 : words.length;
  };

  useEffect(() => {
    setWordCount(calculateWordCount(value));
  }, [value]);

  const toolbar = [
    [{ font: [] }, { size: [] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ color: [] }, { background: [] }],
    [{ script: 'sub' }, { script: 'super' }],
    ['blockquote', 'code-block'],
    [{ list: 'ordered' }, { list: 'bullet' }, { indent: '-1' }, { indent: '+1' }],
    ['link'],
    ['formula'],
    ['clean'],
  ]


  const formats = [
    'font', 'size',
    'bold', 'italic', 'underline', 'strike',
    'color', 'background',
    'script',
    'blockquote', 'code-block',
    'list', 'bullet', 'indent',
    'link', 'image', 'video',
    'formula',
  ];

  return (
    <div>
      <label
        htmlFor="editor"
        className='block mb-2 text-sm font-medium text-gray-700'
      >
        {label}
      </label>
      <Editor
        id="editor"
        theme="snow"
        value={value}
        onChange={onChange}
        toolbar={toolbar}
        formats={formats}
        customOperator={customOperator}
        placeholder={placeholder}
        initialValue={value}
      />
      <div className="flex justify-end mt-2 text-sm text-gray-500">
        Word Count: {wordCount}
      </div>
    </div>
  );
};

export default RichTextEditor;
