import React from 'react';
import { Badge, Button, Title } from '../../design-system';
import Arrow from '../../assets/arrow-left.svg';
import Menu from '../../assets/menu-alt.svg';
import Cat from '../../assets/cat.svg';
import CircularProgressChartStar from '../components/CircularProgressChartStar';

const AssignmentLanding = () => {
    return (
        <main >
            <header className='p-6 pl-10 flex flex-col gap-4'>
                <section className='flex gap-2 ml-8'>
                   
                    <Arrow className='w-5 h-5' />
                  
                    <p>Back to Course</p>
                </section>
                <section className='flex gap-2 items-center'>
                    <Menu />
                    <Title>Great Assignment</Title>
                </section>
                <section className='ml-8 flex flex-col gap-4'>
                <Badge title='Homework' />

                <section className='flex justify-between w-3/4'>
                    <section>
                        <p className='text-slate-600 text-base font-medium'>Due</p>
                        <h2 className='text-slate-600 text-lg font-semibold'>October 11, 2024<br/>12:00pm EST</h2>
                    </section>
                    <section>
                        <p className='text-slate-600 text-base font-medium'>Status</p>
                        <h2 className='text-slate-600 text-lg font-semibold'>Not Started</h2>
                    </section>
                    <section>
                        <p className='text-slate-600 text-base font-medium'>Work Estimate</p>
                        <h2 className='text-slate-600 text-lg font-semibold'>12 questions minimum<br/>25 questions on average</h2>
                    </section>
                </section>

                <section>
                <Button label='Get Started' />
                </section>
                </section>
            </header>

            <section className='bg-[#f8f8f8] p-6'>
                <h3 className='text-slate-900 text-lg font-medium ml-12 pb-4'>Activity</h3>
                <section className='bg-white rounded-xl border border-slate-300 mx-8 flex flex-col justify-center items-center p-6 gap-6'>
                    <Cat />
                    <h4 className='text-slate-800 text-xl font-medium'>No activity yet</h4>
                </section>

                <h3 className='text-slate-900 text-lg font-medium ml-12 py-4'>Objectives</h3>
                <section className='bg-white rounded-xl border border-slate-300 mx-8'>
                    <section className='p-4'>
                        <h4 className='pl-3  pb-2 text-slate-900 text-base font-medium'>Objective 1.1</h4>
                        <p className='pl-3 pb-2 text-slate-700 text-xs font-medium'>1 - 2 questions</p>
                        <section className='flex gap-2 items-center'>
                            <CircularProgressChartStar percentage={0} />
                            <p className='text-slate-700 text-base font-medium'>Objective 1.1.1</p>
                        </section>

                    </section>
                </section>

            </section>
        </main>
    );
};

export default AssignmentLanding;