import React from 'react';
import { Button, TextArea } from '../../design-system';
import DotsVertical from '../../assets/dots-vertical.svg';


const Writing = ({title, question, placeholder}) => {
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
      <main className="w-full border border-slate-300 rounded-lg p-8 bg-white flex flex-col gap-4">
        <h4 className="text-slate-900 font-medium uppercase text-base">
          Question
        </h4>
        <TextArea label={question} placeholder={placeholder} />
        <section className='flex justify-end gap-2'>
            <Button label='More instruction' type='outline' />
            <Button label='Submit' />
        </section>
      </main>
    </article>
  );
};

export default Writing;

