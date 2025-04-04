import React from 'react';

const Checkbox = ({ label = 'Checkbox', checked, onChange, id, isIncorrect, required = false }) => {
  return (
    <article className='flex items-center gap-2'>
      <input
        id={id}
        checked={checked}
        onChange={onChange}
        required={required}
        type="checkbox"
        className={` ${isIncorrect ? 'border-red-500' : 'border-gray-300'}  peer bg-white appearance-none h-5 w-5 border rounded focus:ring-blue-500 focus:ring-2 text-emerald-600 checked:bg-emerald-500 checked:border-0`}
      />

      <svg className='absolute w-3.5 h-3.5 pointer-events-none stroke-none fill-none peer-checked:stroke-white ml-[3px]' width="11" height="8" viewBox="0 0 11 8" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M10.0915 0.951972L10.0867 0.946075L10.0813 0.940568C9.90075 0.753559 9.61032 0.753145 9.42925 0.939327L4.16201 6.22962L1.58507 3.63469C1.40401 3.44841 1.11351 3.44879 0.932892 3.63584C0.755703 3.81933 0.755703 4.10875 0.932892 4.29224L0.932878 4.29225L0.934851 4.29424L3.58045 6.9583C3.73675 7.11955 3.94983 7.2 4.1473 7.2C4.36196 7.2 4.55964 7.11773 4.71407 6.95839L10.0468 1.60235C10.2436 1.41991 10.2421 1.13391 10.0915 0.951972ZM4.2327 6.30081L4.2317 6.2998C4.23206 6.30015 4.23237 6.30049 4.23269 6.30082L4.2327 6.30081Z" fill="white" stroke="white" stroke-width="0.4" />
      </svg>

      {label && <label htmlFor={id} className='text-gray-800 text-sm'>
        {label} {required && <span className="text-red-500">*</span>}
      </label>}
    </article>
  );
};

export default Checkbox;