import React from 'react';

const Notification = ({ type, message }) => {
  const baseClasses = 'w-full max-w-2xl text-white text-base font-semibold px-8 p-2 rounded';
  
  const typeClasses = {
    error: 'bg-red-500',
    warning: 'bg-yellow-500',
    success: 'bg-emerald-500',
  };

  return (
    <p className={`${typeClasses[type]} ${baseClasses}`}>
      {message}
    </p>
  );
};

export default Notification;
