import React, { useState, useEffect } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import './RichTextEditor.css'; 

// TODO add a math keyboard
const RichTextEditor = ({ label='Rich Text Editor', value, onChange, placeholder = 'Type here' }) => {
    const [wordCount, setWordCount] = React.useState(0);

    const calculateWordCount = (text) => {
      const plainText = text.replace(/<\/?[^>]+(>|$)/g, '');
      const words = plainText.trim().split(/\s+/);
      return words[0] === '' ? 0 : words.length;
    };

    useEffect(() => {
      setWordCount(calculateWordCount(value));
    }, [value]);
  
    const modules = {
      toolbar: [
        [{ font: [] }, { size: [] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ color: [] }, { background: [] }],
        [{ script: 'sub' }, { script: 'super' }],
        ['blockquote', 'code-block'],
        [{ list: 'ordered' }, { list: 'bullet' }, { indent: '-1' }, { indent: '+1' }],
        ['link', 'image', 'video'],
        ['formula'],
        ['clean'],
      ],
      clipboard: {
        matchVisual: false,
      },
    };
  
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
        <ReactQuill
          id="editor"
          theme="snow"
          value={value}
          onChange={onChange}
          modules={modules}
          formats={formats}
          placeholder={placeholder}
        />
        <div className="flex justify-end mt-2 text-sm text-gray-500">
          Word Count: {wordCount}
        </div>
      </div>
    );
};

export default RichTextEditor;
