import React from 'react';

const Input = ({ label = 'Input',  placeholder = '', value, onChange, id,width = 'w-full',
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
        className={`${width} px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 border-gray-300 focus:ring-blue-500 focus:border-blue-500`}
      />
    </article>
  );
}

export default Input;