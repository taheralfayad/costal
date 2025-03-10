import React from 'react';
import { CircularProgressChart } from '../../design-system';

const Objective = ({title, estimateQuestions, subObjectives}) => {
    return (
        <section className='p-4'>
            <h4 className='pl-3  pb-2 text-slate-900 text-base font-medium'>{title}</h4>
            <p className='pl-3 pb-2 text-slate-700 text-xs font-medium'>{estimateQuestions}</p>
            <section>
                {subObjectives.map((subObj, index) => {
                    return <section key={index} className='flex gap-2 items-center'>
                    <CircularProgressChart percentage={subObj.percentage} showStar size='small' backgroundColor='#CBD5E1' />
                    <p className='text-slate-700 text-base font-medium'>{subObj.title}</p>
                </section>
                })}
            </section>
            
        </section>
    );
};

export default Objective;