
import React from 'react';

const TaskSummary = ({title, description, nextLine = ''}) => {
    return (
        <section>
            <p className='text-slate-600 text-base font-medium'>{title}</p>
            <h2 className='text-slate-600 text-lg font-semibold'>{description}{nextLine ? <><br/> {nextLine}</> : <></> }</h2>
        </section>

    );
};

export default TaskSummary;