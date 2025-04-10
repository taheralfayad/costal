import React from 'react';

const Button = ({ label = 'Button', icon = null, onClick, type = 'primary', className = '', form = false, disabled = false  }) => {
  const baseStyle =
    'flex items-center gap-2 px-4 py-2 rounded-md font-medium text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition';
  const customStyles = {
    primary: 'bg-blue-500 text-white hover:bg-blue-600 focus:ring-blue-500',
    outline:
      'border border-blue-500 text-blue-500 hover:bg-blue-100 focus:ring-blue-500 bg-white',
    blackOutline:
      'border border-slate-900 text-slate-900 hover:bg-gray-100 focus:ring-blue-500',
    lightGreenOutline:
      'border border-blue-500 text-blue-500 bg-blue-100 hover:bg-blue-200 focus:ring-blue-500',
    text: 'text-blue-500 hover:text-blue-600 focus:ring-blue-500',
    gray: 'text-gray-700 bg-transparent hover:text-blue-500 focus:ring-blue-500',
    softGray: 'border border-gray-300 text-gray-700 bg-white hover:bg-gray-100 focus:ring-gray-400',
    red: 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-500',
    black: 'bg-black text-white hover:bg-slate-800 focus:ring-black'
  };

  const disabledStyle = 'opacity-50 cursor-not-allowed';
  
  return (
    <button
      className={`${baseStyle} ${customStyles[type]} ${disabled ? disabledStyle : ''} ${className}`}
      onClick={onClick}
      type={form ? 'submit' : 'button'}
      disabled={disabled}
    >
      {icon && <span className='text-lg'>{icon}</span>}
      {label}
    </button>
  )
}

export default Button;