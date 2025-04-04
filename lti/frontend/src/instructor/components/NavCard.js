import React from 'react';

const NavCard = ({ description }) => {
  return (
    <article className='border rounded-lg p-4 shadow-sm bg-white'>

      <p className='text-base font-medium text-slate-900'>
        {description}
      </p>
    </article>
  );
};

export default NavCard;
