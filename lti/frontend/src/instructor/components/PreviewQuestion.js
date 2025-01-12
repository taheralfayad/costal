import React from 'react';
import DotsVertical from '../../assets/dots-vertical.svg';
import { TextArea, CorrectAnswer } from '../../design-system';

const PreviewQuestion = ({ title, points, percentage, question, placeholder = 'Placeholder', correctAnswer }) => {
  return (
    <article className='w-[90%] mx-auto'>
      <header className="flex justify-between items-center mb-4">
        <h3 className="text-slate-900 font-medium text-base">{title}</h3>
        <button className="text-slate-400">
          <div className="flex flex-col space-y-1">
            <DotsVertical />
          </div>
        </button>
      </header>
      <main className="w-full border border-slate-300 rounded-lg p-8 bg-white flex flex-col gap-4">
        <h4 className="text-slate-900 font-medium uppercase text-base">
          Question
          <span className="text-blue-500 ml-4">{points} Point ({percentage}%)</span>
        </h4>
        <TextArea label={question} placeholder={placeholder} />
        <CorrectAnswer correctAnswer={correctAnswer} />
      </main>
    </article>
  );
};

export default PreviewQuestion;