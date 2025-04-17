import MathInput from "react-math-keyboard";
import React, { useRef, useState } from "react";
import { Button, TextArea, Notification } from '../../design-system';
import DotsVertical from '../../assets/dots-vertical.svg';
import styles from "./styles.css";
import 'quill-editor-math/dist/index.css';


const Writing = ({ title, question, placeholder, onSubmit, onHintRequest, isCorrect, isMath = false }) => {
  const firstMathfieldRef = useRef();
  const [value, setValue] = useState("");



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
          {isMath ? <article className='mb-4'><MathInput
            setValue={(val) => {
              setValue(val);
            }}
            style={{
              border: !isCorrect && '#f87171',
              boxShadow: !isCorrect && '0 0 0 2px rgba(248, 113, 113, 0.5)'
            }}
            setMathfieldRef={(mathfield) => {
              if (mathfield) {
                firstMathfieldRef.current = mathfield;

                const mathElement = mathfield.$el;
              }
            }}
            divisionFormat="obelus"
          /></article> : <TextArea placeholder={placeholder} isCorrect={isCorrect} label='' value={value} onChange={(e) => setValue(e.target.value)}/>}
          <section className='flex justify-end gap-2'>
            <Button label='More instruction' type='outline' onClick={onHintRequest} />
            <Button label='Submit' onClick={() => onSubmit(value, setValue)} disabled={!(isCorrect === '-1')}/>
          </section>
        </section>
      </main>
    </article>
  );
};

export default Writing;

