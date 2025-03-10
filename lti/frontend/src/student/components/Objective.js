import React from 'react';
import { CircularProgressChart } from '../../design-system';

const Objective = ({subObjectives}) => {
    return (
        <section className='p-4'>
            <section>
                {subObjectives.map((subObj, index) => {
                    return <section key={index} className='flex gap-2 items-center'>
                    <CircularProgressChart percentage={subObj.percentage} showStar size='small' backgroundColor='#CBD5E1' />
                    <p className='text-slate-700 text-base font-medium'>{subObj.title} - {subObj.numberOfQuestions}</p>
                </section>
                })}
            </section>
            
        </section>
    );
};

export default Objective;
