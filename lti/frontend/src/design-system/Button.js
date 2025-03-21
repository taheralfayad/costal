import React from 'react';

const Button = ({ label = 'Button', icon = null, onClick, type = 'primary', className = '', form = false }) => {
  const baseStyle =
    'flex items-center gap-2 px-4 py-2 rounded-md font-medium text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition';
  const customStyles = {
    primary: 'bg-emerald-500 text-white hover:bg-emerald-600 focus:ring-emerald-500',
    outline:
      'border border-emerald-500 text-emerald-500 hover:bg-emerald-100 focus:ring-emerald-500 bg-white',
    blackOutline:
      'border border-slate-900 text-slate-900 hover:bg-gray-100 focus:ring-emerald-500',
    lightGreenOutline:
      'border border-emerald-500 text-emerald-500 bg-emerald-100 hover:bg-emerald-200 focus:ring-emerald-500',
    text: 'text-emerald-500 hover:text-emerald-600 focus:ring-emerald-500',
    gray: 'text-gray-700 bg-transparent hover:text-emerald-500 focus:ring-emerald-500',
    softGray: 'border border-gray-300 text-gray-700 bg-white hover:bg-gray-100 focus:ring-gray-400',
    red: 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-500',
    black: 'bg-black text-white hover:bg-slate-800 focus:ring-black'
  };

  return (
    <button
      className={`${baseStyle} ${customStyles[type]} ${className}`}
      onClick={onClick}
      type={form ? 'submit' : 'button'}
    >
      {icon && <span className='text-lg'>{icon}</span>}
      {label}
    </button>
  )
}

export default Button;