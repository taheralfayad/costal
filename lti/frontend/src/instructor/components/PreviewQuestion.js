import React from 'react';
import DotsVertical from '../../assets/dots-vertical.svg';
import { CorrectAnswer } from '../../design-system';
import DropdownMenu from './DropdownMenu';
import katex from "katex";
import 'quill-editor-math/dist/index.css'
import 'quill/dist/quill.core.css';  

const PreviewQuestion = ({ title, points, percentage, question, placeholder = 'Placeholder', isMath, correctAnswer, type, possibleAnswers, handleDeleteQuestion, handleEditQuestion, id, handleDeleteFromAssignment }) => {

  const renderQuestionType = () => {
    if (type == 'short') {
      return <><div className="prose prose-slate mb-2">
      <div dangerouslySetInnerHTML={{ __html: question }} />
    </div>
        <p className="w-full h-16 p-4 text-slate-700 text-sm mt-4
       rounded-md border border-gray-200 justify-start items-start gap-2.5 inline-flex">{placeholder}</p></>
    } else {
      if (possibleAnswers.filter(ans => ans.is_correct).length < 2) {
        return <><div className="prose prose-slate mb-2">
        <div dangerouslySetInnerHTML={{ __html: question }} />
      </div>
          {possibleAnswers.map((p) => {
            return <section className="flex items-center space-x-2 cursor-pointer">
              <div className="w-4 h-4 border border-gray-300 rounded-full"></div>
              {isMath ? <span className="text-gray-800 text-sm mb-2" dangerouslySetInnerHTML={{ __html: katex.renderToString(p.answer) }}></span> : <span className="text-gray-800 text-sm mb-2">{p.answer}</span>}
            </section>
          })}
        </>
      } else {
        return <><div className="prose prose-slate mb-2">
        <div dangerouslySetInnerHTML={{ __html: question }} />
      </div>
          {possibleAnswers.map((p) => {
            return <section className="flex items-center space-x-2 cursor-pointer">
            <div className="w-4 h-4 border border-gray-300 rounded-sm"></div>
            {isMath ? <span className="text-gray-800 text-sm mb-2" dangerouslySetInnerHTML={{ __html: katex.renderToString(p.answer) }}></span> : <span className="text-gray-800 text-sm mb-2">{p.answer}</span>}
          </section>
          })}
        </>
      }
    }
  }

  return (
    <article className='w-[90%] mx-auto'>
      <header className="flex justify-between items-center mb-4">
        <h3 className="text-slate-900 font-medium text-base">{title}</h3>
        <button className="text-slate-400">
          <div className="flex flex-col space-y-1">
          <DropdownMenu editFunction={() => handleEditQuestion(id)} deleteFunction={() => handleDeleteQuestion(id)} name={title} objectType='QUESTION' handleDeleteFromAssignment={() => handleDeleteFromAssignment(id)} />
          </div>
        </button>
      </header>
      <main className="w-full border border-slate-300 rounded-lg p-8 bg-white flex flex-col gap-4">
        <h4 className="text-slate-900 font-medium uppercase text-base">
          Question
          <span className="text-blue-500 ml-4">{points} Point ({percentage})</span>
        </h4>
        <article>
          {renderQuestionType()}
        </article>
        <CorrectAnswer correctAnswer={correctAnswer} />
      </main>
    </article>
  );
};

export default PreviewQuestion;
