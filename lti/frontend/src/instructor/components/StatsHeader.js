import React from 'react';
import Arrow from '../../assets/arrow-left.svg';
import { Button } from '../../design-system';

// TODO merge with CourseInfo.js
const StatsHeader = ({ icon, title, description }) => {
    return (
        <header className='flex p-6 pl-9 items-start justify-between'>
            <Arrow className='mt-1 mr-2' />
            <section className='w-full flex justify-between items-center'>
                <section className='flex flex-col gap-2'>
                    <h1 className='text-slate-950 text-2xl font-semibold'>{title}</h1>
                    <section className='flex'>
                        {icon}
                        <p className='text-slate-600 text-base font-medium ml-1'>{description}</p>
                    </section>
                </section>
                <Button type='lightGreenOutline' label='Settings' />
            </section>
        </header>
    );
};

export default StatsHeader;