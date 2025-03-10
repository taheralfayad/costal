import React from 'react';

const NavCard = ({ chapter, title, description }) => {
  return (
    <article className='border rounded-lg p-4 shadow-sm bg-white'>
      <p className='text-sm text-gray-500 font-medium'>
        {chapter} &gt; {title}
      </p>

      <p className='text-base font-medium text-slate-900 mt-2'>
        {description}
      </p>
    </article>
  );
};

export default NavCard;
