import React, { useEffect, useState } from 'react';

const Dropdown = ({ label = 'Dropdown', placeholder = '', options = [], width = 'w-full', margin = true, required = false, value = ''}) => {
  const [selected, setSelected] = useState(value);

  useEffect(() => {
    setSelected(value);
  }, [value]);

  const handleChange = (event) => {
    setSelected(event.target.value);
    const option = options.find(opt => opt.label === event.target.value);
    if (option && option.onClick) option.onClick(); 
  };

  return (
    <article className={`${margin ? 'mb-4' : ''}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <section className="relative">
        <select
          className={`${width} px-3 pr-6 py-2 bg-white border  'border-gray-300 rounded-md shadow-sm text-gray-600 focus:outline-none focus:ring-blue-500 focus:border-blue-500 appearance-none`}
          value={selected}
          onChange={handleChange}
          required={required}
        >
          <option value="" disabled>{placeholder || 'Select an option'}</option>
          {options.map((option, index) => (
            <option key={index} value={option.label} className="appearance-none text-gray-700 hover:bg-emerald-100 px-3 py-2">
            {option.label}
          </option>
          ))}
        </select>
        <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <svg className="h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </span>
      </section>
    </article>
  );
};

export default Dropdown;
