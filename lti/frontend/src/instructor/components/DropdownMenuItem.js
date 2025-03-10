import React from 'react';

const DropdownMenuItem = ({onClick, label}) => {
    return (
        <button
            className='w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-gray-100 focus:text-white focus:bg-emerald-400'
            onClick={onClick}
        >
            {label}
        </button>
    );
};

export default DropdownMenuItem;


