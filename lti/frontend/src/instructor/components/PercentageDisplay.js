import React from 'react';
import CircularProgressChart from './CircularProgressChart';

const PercentageDisplay = ({title, description, percentage, long=false}) => {
  return (
    <article className={`${long ? 'w-[430px]' :  'w-96'} justify-center items-center bg-white rounded-xl border border-slate-300 flex gap-6`}>
      <section className='flex flex-col gap-4'>
        <h3 className='text-slate-900 text-base font-medium'>{title}</h3>
        <p className='text-slate-700 text-sm font-medium'>{description}</p>
      </section>
      <CircularProgressChart percentage={percentage} />
    </article>
  );
};

export default PercentageDisplay;