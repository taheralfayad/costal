import React, { useState } from 'react';
import { TextArea, CorrectAnswer, Button } from '../../design-system';
import katex from "katex";
import 'quill-editor-math/dist/index.css';

const SelectQuestion = ({ type, title, isMath, possibleAnswers, question, placeholder = 'Placeholder', correctAnswer, onAdd, onDelete, onDeleteForever, onEdit, value }) => {
    const [isSelected, setSelected] = useState(value);

    const handleToggle = () => {
        if (isSelected) {
            onDelete();
        } else {
            onAdd();
        }
        setSelected(!isSelected);
    };

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
                            <div className="w-4 h-4 border border-gray-300 rounded-sm mb-2"></div>
                            {isMath ? <span className="text-gray-800 text-sm" dangerouslySetInnerHTML={{ __html: katex.renderToString(p.answer) }}></span> : <span className="text-gray-800 text-sm mb-2">{p.answer}</span>}
                        </section>
                    })}
                </>
            }
        }
    }

    return (
        <main className='border rounded-lg p-6 mb-4 shadow-sm bg-white'>
            <h2 className='text-slate-900 text-base font-medium mb-2'>{title}</h2>

            <article>
                {renderQuestionType()}
            </article>

            <CorrectAnswer correctAnswer={correctAnswer} />

            <section className='flex justify-end gap-2 mt-4 pb-2'>
                <Button label='Delete' type='outline' onClick={onDeleteForever} />
                <Button label='Edit' type='outline' onClick={onEdit} />

                <Button label={isSelected ? 'Remove' : 'Add'} type={isSelected ?
                    'outline' : 'primary'} onClick={handleToggle} />

            </section>
        </main>
    );
};

export default SelectQuestion;
