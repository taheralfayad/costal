import React from 'react';
import DotsVertical from '../../assets/dots-vertical.svg';
import Check from '../../assets/check.svg';
import XClose from '../../assets/x-close.svg';
import { Button, CorrectAnswer } from '../../design-system';

const Answered = ({ title, question, correctAnswer, studentAnswer, isCorrect }) => {
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
          <label className='block text-sm font-medium text-gray-700'>{question}</label>

        </section>

        <section className={`${isCorrect ? 'bg-emerald-500' : 'bg-red-500'} text-white flex gap-2 rounded p-4`}>
          {isCorrect ? <Check /> : <XClose />}
          <p className='text-base font-semibold'>{isCorrect ? 'Perfect. Your hard work is paying off' : 'Keep trying - mistakes can help us grow.'}</p>
        </section>
        <section className='px-8 pb-8 flex flex-col gap-6'>
          <p className="w-full h-16 p-4 text-slate-700 text-base font-medium mt-4
            bg-gray-100 rounded-md border border-gray-200 justify-start items-start gap-2.5 inline-flex">{studentAnswer}</p>

          <p className='text-slate-900 text-lg font-medium'>ANSWER EXPLANATION</p>
          <CorrectAnswer correctAnswer={correctAnswer} />

          <section className='flex flex-col gap-2'>
            <p>Here is a super duper fun explanation on how to achieve the answer</p>
            <p className='text-center'>y = 2x</p>
            <p className='text-center'>where x = 4</p>
            <p>Now we can plug x</p>
            <p className='text-center'>y = 2 (4)</p>
            <p className='text-center'>y = 8</p>
          </section>
          <section className='flex justify-end'>
            <Button label='Continue' />
          </section>
        </section>
      </main>
    </article>
  );
};

export default Answered;