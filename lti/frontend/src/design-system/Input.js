import React, { useState } from 'react';

const Input = ({ label = 'Input',  placeholder = '', type = 'text', value, onChange, id, min = null, max = null, width = 'w-full', required = false
  }) => {
    const [isValid, setIsValid] = useState(true);

    const handleInputChange = (e) => {
    const val = e.target.value;

    // If type is number and min/max are defined, validate the value
    if (type === 'number' && (min !== null || max !== null)) {
      const numValue = parseInt(val, 10);

      if ((numValue >= min && numValue <= max) || val === '') {
        setIsValid(true); // Valid value
      } else {
        setIsValid(false); // Invalid value
      }
    }

    onChange(e);
  };
  return (
    <article className='mb-4'>
      {label && (
        <label
          className='block mb-2 text-sm font-medium text-gray-700'
        >
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <input
        id={id}
        type={type}
        value={value}
        onChange={handleInputChange}
        placeholder={placeholder}
        required={required}
        min={min}
        max={max}
        className={`${width} px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${isValid
        ? 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
        : 'border-red-500 focus:ring-red-500 focus:border-red-500'}`}
      />
    </article>
  );
}

export default Input;