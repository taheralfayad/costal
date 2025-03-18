import React, { useState, useEffect } from 'react';
import { Input, Button } from '../../design-system';
import Trash from '../../assets/trash-can.svg';
import ChevronDown from '../../assets/chevron-down.svg';

const ShortAnswerConfig = ({ items, setItems }) => {
  const [inputValue, setInputValue] = useState('');
  const [isListVisible, setIsListVisible] = useState(true);

  const handleAddItem = () => {
    if (inputValue.trim() !== '') {
      setItems([...items, inputValue]);
      setInputValue('');
    }
  };

  const handleRemoveItem = (index) => {
    const updatedItems = items.filter((_, i) => i !== index);
    setItems(updatedItems);
  };

  const toggleListVisibility = () => {
    setIsListVisible(!isListVisible);
  };

  return (
    <section className='p-4 w-full'>
      <section className='flex items-center'>
        <section className="mb-4 w-full mr-4 flex items-center gap-2">
          <Input
            label="Accepted Answers"
            placeholder="Great Answer"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="flex-1"
          />
          <div className="w-fit pt-2">
            <Button label="Add" className="px-4 py-2.5 text-sm" onClick={handleAddItem} />
          </div>
        </section>
        <button
          onClick={toggleListVisibility}
          className={`transform transition-transform ${isListVisible ? '' : 'rotate-[180deg]'}`}
          type='button'
        >
          <ChevronDown />
        </button>
      </section>
      {isListVisible && (
        <ul className='flex flex-col gap-2 mb-4'>
          {items.map((item, index) => (
            <li key={index} className='flex items-center justify-between p-2 border rounded-md bg-white shadow'>
              <p className='text-sm font-medium text-gray-700'>{item}</p>
              <Trash onClick={() => handleRemoveItem(index)} className='text-slate-500 hover:text-red-600' />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};


export default ShortAnswerConfig;