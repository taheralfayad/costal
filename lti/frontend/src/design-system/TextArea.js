import React from 'react';

const TextArea = ({ label = 'TextArea',  placeholder = '', value, onChange, id,width = 'w-full', isIncorrect = false
  }) => {
    
  return (
    <article className='mb-4'>
      {label && (
        <label
          className='block mb-2 text-sm font-medium text-gray-700'
        >
          {label}
        </label>
      )}
      <textarea
        id={id}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`${width} ${isIncorrect ? 'border-red-500' : 'border-gray-300'} px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:ring-blue-500 focus:border-blue-500`}
      />
    </article>
  );
}

export default TextArea;