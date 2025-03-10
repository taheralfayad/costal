import React, { useState } from 'react';
import ChevronDown from '../../assets/chevron-down.svg';
import StarFill from '../../assets/star-fill.svg';
import Star from '../../assets/star.svg';

const ChapterDropdown = ({ chapterTitle, children, fullSelected }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <div
        className='flex items-center cursor-pointer space-x-2 py-2'
        onClick={() => setIsOpen(!isOpen)}
      >
        <span
          className={`transform transition-transform ${
            isOpen ? '' : 'rotate-[-90deg]'
          }`}
        >
          <ChevronDown />
        </span>
        {fullSelected ? <StarFill /> : <Star />}
        <span className='text-lg font-semibold'>{chapterTitle}</span>
      </div>
      {isOpen && <div className='ml-6'>{children}</div>}
    </div>
  );
};

export default ChapterDropdown;
