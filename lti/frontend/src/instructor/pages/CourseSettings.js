import React from 'react';
import { Button, Dropdown, Input, Title } from '../../design-system';
import Toggle from '../../design-system/Toggle';

const CourseSettings = () => {
    return (
        <main className='p-6 pl-10 flex flex-col gap-6'>
            <header className='flex gap-14'>
            <Title>Course Settings</Title>
            <Button type='blackOutline' label='Copy Course' />
            </header>
            <h2 className='text-slate-950 text-2xl font-semibold'>Grading</h2>
            <section className='flex items-center justify-between mb-6'>
                <section>
                    <h3 className='text-slate-900 text-lg font-semibold leading-7'>Award credit for partial completion of assignments</h3>
                    <p className='text-slate-600 text-base font-medium'>Record student mastery at due date for partially completed assignments</p>
                </section>
                <Toggle color='bg-slate-800' />
            </section>
            <section className='flex items-center justify-between mb-6'>
                <section>
                <h3 className='text-slate-900 text-lg font-semibold leading-7'>Allow late completion for assignments</h3>
                <p className='text-slate-600 text-base font-medium'>Students can turn in completed assignments after the due date</p>
                </section>
                <Toggle color='bg-slate-800' />
            </section>

            <section className='ml-16'>
                <h4 className='text-slate-900 text-lg font-semibold leading-7 mb-4'>Set Final Deadline</h4>
                <section className='flex items-center gap-4'>
                    <p className='text-slate-600 text-base font-medium mb-4'>Let students turn in completed assignments up to</p>
                    <Dropdown width='w-44' label='' />
                </section>
                <h4 className='text-slate-900 text-lg font-semibold leading-7 mb-4'>Penalize Late Completion</h4>
                <section className='flex items-center gap-4'>
                    <p className='text-slate-600 text-base font-medium mb-4'>Deduct a </p>
                    <Input label='' width='w-20' type='number' />
                    <p className='text-slate-600 text-base font-medium mb-4'>% penalty upon completion</p>
                    <Dropdown width='w-44' label='' />
                </section>
            </section>

        </main>
    );
};

export default CourseSettings;
