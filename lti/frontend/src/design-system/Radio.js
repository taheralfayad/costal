import React from 'react';

const Radio = ({ label = 'Radio', checked, onChange, id }) => {
    return (
        <article className='flex items-center gap-2'>
            <input
                id={id}
                checked={checked}
                onChange={onChange}
                type="checkbox"
                className='peer bg-white relative appearance-none h-5 w-5 border rounded-full focus:ring-blue-500 focus:ring-2 checked:bg-slate-50 checked:border-emerald-400'
            />

            <span
                className='absolute w-3 h-3 pointer-events-none bg-none rounded-full peer-checked:bg-emerald-400 ml-[4px]'
            />

            {label && <label htmlFor={id} className='text-gray-800 text-sm'>
                {label}
            </label>}
        </article>
    );
};

export default Radio;