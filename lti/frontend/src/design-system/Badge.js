import React from 'react';

const Badge = ({title = 'Badge', color = 'primary'}) => {
  const customStyles = {
    primary: 'bg-blue-500'
  }
  return (
    <article className={`text-white text-sm font-medium h-[25px] w-24 px-2.5 py-[3px] rounded-[30px] justify-center items-center gap-px inline-flex ${customStyles[color]}`}>
      {title}
    </article>
  );
}

export default Badge;