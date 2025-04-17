import React from 'react';
import DotsVertical from '../../assets/dots-vertical.svg';
import Check from '../../assets/check.svg';
import XClose from '../../assets/x-close.svg';
import { Button, CorrectAnswer } from '../../design-system';
import katex from "katex";
import 'quill-editor-math/dist/index.css';

const Answered = ({ title, question, correctAnswer, studentAnswer, isCorrect, explanation, setMoveOnToNextQuestionFromExplanation, isMath }) => {
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

        <section className={`${isCorrect ? 'bg-emerald-500' : 'bg-red-500'} text-white flex gap-2 rounded p-4`}>
          {isCorrect ? <Check /> : <XClose />}
          <p className='text-base font-semibold'>{isCorrect ? 'Perfect. Your hard work is paying off' : 'Keep trying - mistakes can help us grow.'}</p>
        </section>
        <section className='px-8 pb-8 flex flex-col gap-6'>
          <p className='text-slate-900 text-lg font-medium'>YOUR ANSWER</p>
          <p className="w-full h-16 p-4 text-slate-700 text-base font-medium mt-4
            bg-gray-100 rounded-md border border-gray-200 justify-start items-start gap-2.5 inline-flex"> {isMath ? <span className="text-gray-800 text-sm mb-2" dangerouslySetInnerHTML={{ __html: katex.renderToString(studentAnswer) }}></span> : <span className="text-gray-800 text-sm mb-2">{studentAnswer}</span>}</p>

          <p className='text-slate-900 text-lg font-medium'>ANSWER EXPLANATION</p>
          <CorrectAnswer correctAnswer={correctAnswer} />

          <section className='flex flex-col gap-2'>
            {explanation && <p>Here's how you can get the right answer next time!</p>}

            <div className="prose mb-2">
              <div dangerouslySetInnerHTML={{ __html: question }} />
            </div>
          </section>
          <section className='flex justify-end'>
            <Button label='Continue' onClick={() => setMoveOnToNextQuestionFromExplanation(true)} />
          </section>
        </section>
      </main>
    </article>
  );
};

export default Answered;