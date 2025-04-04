import MathInput from "react-math-keyboard";
import React, { useRef, useState } from "react";
import { Button, TextArea } from '../../design-system';
import DotsVertical from '../../assets/dots-vertical.svg';
import styles from "./styles.css";


const Writing = ({ title, question, placeholder, onSubmit, onHintRequest, isIncorrect, isMath = false }) => {
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
          <div className='block mb-2 text-sm font-medium text-gray-700' dangerouslySetInnerHTML={{ __html: question }}></div>
        </section>
        {isIncorrect && (<p className='bg-red-500 w-full text-white text-base font-semibold pl-8 p-2 mb-4 rounded'>Sorry, that's incorrect.</p>)}
        <section className='px-8 pb-8'>
          {isMath ? <article className='mb-4'><MathInput
            setValue={(val) => {
              setValue(val);
            }}
            style={{
              border: isIncorrect && '#f87171',
              boxShadow: isIncorrect && '0 0 0 2px rgba(248, 113, 113, 0.5)'
            }}
            setMathfieldRef={(mathfield) => {
              if (mathfield) {
                firstMathfieldRef.current = mathfield;

                const mathElement = mathfield.$el;
              }
            }}
            divisionFormat="obelus"
          /></article> : <TextArea placeholder={placeholder} isIncorrect={isIncorrect} label='' value={value} onChange={(e) => setValue(e.target.value)}/>}
          <section className='flex justify-end gap-2'>
            <Button label='More instruction' type='outline' onClick={onHintRequest} />
            <Button label='Submit' onClick={() => onSubmit(value, setValue)} disabled={isIncorrect}/>
          </section>
        </section>
      </main>
    </article>
  );
};

export default Writing;

