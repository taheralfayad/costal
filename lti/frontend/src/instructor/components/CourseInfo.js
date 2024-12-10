import React from 'react';
import User from '../../assets/user.svg';
import Calendar from '../../assets/calendar.svg';

const CourseInfo = () => {
    return (
        <article className='flex flex-col gap-2'>
            <section className='flex'>
                <User />
                <p className='text-slate-600 text-base font-medium'>Bob Doe</p>
            </section>
            <section className='flex'>
                <Calendar />
                <p className='text-slate-600 text-base font-medium'>Aug 23, 2024 - Dec 10, 2024</p>
            </section>
        </article>
    );
};

export default CourseInfo;