import React from 'react';
import XClose from '../../assets/x-close.svg'; 
import Check from '../../assets/check.svg'; 
import Menu from '../../assets/menu-alt.svg'; 


const ResultItem = ({ type, status, text, time }) => {

    return (
        <div className='flex items-center justify-between p-4'>
            <div>
                {status === 'correct' && <Check />}
                {status === 'incorrect' && <XClose />}
                {type === 'instruction' && <Menu />}
            </div>
            <p className='flex-1 text-slate-900 text-base font-medium mx-4 truncate'>{text}</p>
            <span className='text-sm text-gray-500'>{time}</span>
        </div>
    )
}

export default ResultItem;
