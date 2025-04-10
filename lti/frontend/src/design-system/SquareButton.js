import React from 'react';

const SquareButton = ({ label, isActive, onClick, icon, noBorder }) => {
    return (
        <button
            onClick={onClick}
            className={`flex items-center px-4 py-2 font-medium
      ${isActive ? 'bg-blue-500 text-white border border-blue-500' : noBorder ? 'bg-white text-slate-700 border-y border-l border-slate-700' :  'bg-white text-slate-700 border border-slate-700' }
      hover:bg-blue-600 hover:text-white transition hover:border-blue-600`}
        >
            {icon} 
            {label}
        </button>
    );

}

export default SquareButton;