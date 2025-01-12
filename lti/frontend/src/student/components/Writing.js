import React, { useState } from 'react';
import { Button, TextArea } from '../../design-system';
import DotsVertical from '../../assets/dots-vertical.svg';


const Writing = ({ title, question, placeholder }) => {
  const [isIncorrect, setIncorrect] = useState(true)

  return (
    <article className='w-[90%] mx-auto'>
      <header className="flex justify-between items-center mb-4">
        <h3 className="text-slate-900 font-medium text-base">{title}</h3>
        <button className="text-slate-900">
          <div className="flex flex-col space-y-1">
            <DotsVertical />
          </div>
        </button>
      </header>
      <main className="w-full border border-slate-300 rounded-lg bg-white flex flex-col gap-2">
        <section className='px-8 pt-8 flex flex-col gap-4'>
          <h4 className="text-slate-900 font-medium uppercase text-base">
            Question
          </h4>
          <label className='block mb-2 text-sm font-medium text-gray-700'>{question}</label>
        </section>
        {isIncorrect && (<p className='bg-red-500 w-full text-white text-base font-semibold pl-8 p-2 mb-4 rounded'>Sorry, that's incorrect. Try again?</p>)}
        <section className='px-8 pb-8'>
          <TextArea placeholder={placeholder} isIncorrect={isIncorrect} label='' />
          <section className='flex justify-end gap-2'>
            <Button label='More instruction' type='outline' />
            <Button label='Submit' />
          </section>
        </section>
      </main>
    </article>
  );
};

export default Writing;

