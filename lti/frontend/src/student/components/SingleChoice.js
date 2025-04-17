import React, { useState } from 'react';
import { Button, Radio, Notification } from '../../design-system';
import DotsVertical from '../../assets/dots-vertical.svg';
import RadioGroup from '../components/RadioGroup.js';
import 'quill-editor-math/dist/index.css';


const SingleChoice = ({ title, question, options, onSubmit, onHintRequest, isCorrect, isMath }) => {
  
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
      <main className="w-full border border-slate-300 rounded-lg bg-white flex flex-col gap-4">
        <section className='px-8 pt-8 flex flex-col gap-4'>
          <h4 className="text-slate-900 font-medium uppercase text-base">
            Question
          </h4>
          <div className="prose prose-slate mb-2">
            <div dangerouslySetInnerHTML={{ __html: question }} />
          </div>
        </section>
        <div className="mt-6 mx-60 flex justify-center text-center">
          {!isCorrect && (
            <Notification
              type='error'
              message='Not quite! Keep going.'
            />
          )}
          {isCorrect !== '-1' && isCorrect === true && (
            <Notification
              type='success'
              message='Great job!'
            />
          )}
        </div>
        <section className='px-8 pb-8'>
          <RadioGroup options={options} isMath={isMath}/> 
          <section className='flex justify-end gap-2'>
            <Button label='More instruction' type='outline' onClick={onHintRequest} />
            <Button label='Submit' onClick={onSubmit} disabled={!(isCorrect === '-1')}/>
          </section>
        </section>
      </main>
    </article>
  );
};

export default SingleChoice;

