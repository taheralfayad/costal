import React, { useState } from 'react';
import ChevronDown from '../assets/chevron-down.svg';

const Dropdown = ({ label = 'Dropdown', placeholder = '', options = [], onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState(null);

  const toggleDropdown = () => setIsOpen(!isOpen);

  const handleOptionClick = (option) => {
    setSelected(option);
    setIsOpen(false);
    if (onSelect) onSelect(option);
  };

  return (
    <article className='mb-4 w-full'>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <section className="relative">
        <button
          className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-left text-gray-600 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          onClick={toggleDropdown}
        >
          {selected || 'Dropdown'}
          <span className="absolute inset-y-0 right-0 flex items-center pr-3">
            <ChevronDown className="h-4 w-4 text-gray-400" />
          </span>
        </button>

        {isOpen && (
          <ul className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto focus:outline-none sm:text-sm">
            {options.map((option, index) => (
              <li
                key={index}
                className="cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-emerald-100"
                onClick={() => handleOptionClick(option)}
              >
                <span className="block truncate text-gray-700">{option}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </article>
  );
};

export default Dropdown;