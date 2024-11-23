import React from 'react';
import Badge from '../../design-system/Badge';
import CalendarIcon from '../../assets/calendar.svg';
import Button from '../../design-system/Button';
import PreviewQuestion from '../components/PreviewQuestion';


const AssignmentPreview = () => {

  return (
    <main className='p-6 pl-10 flex flex-col gap-4'>
      <header>
        <section className='flex justify-between items-center'>
          <section className='flex flex-col gap-4'>
            <h1 className='text-slate-950 text-3xl font-semibold'>Great Assignment</h1>
            <Badge title='Homework' />
            <section className='flex'>
              <CalendarIcon />
              <article className='pl-2'>
                <p className='text-slate-600'>Starts on <b>October 10, 2024</b> at <b>12:00pm EST</b></p>
                <p className='text-slate-600'>Ends on <b>October 11, 2024</b> at <b>12:00pm EST</b></p>
              </article>
            </section>
          </section>
          <Button type='greenOutline' label='Settings' />
        </section>

        <section className='mt-10 mb-2 flex justify-between items-center h-24 rounded-md border border-slate-300'>
          <section className='flex justify-evenly gap-4 pl-4'>
            <article className='text-center'>
              <h2 className='text-slate-500 text-lg font-medium'>Objectives</h2>
              <h3 className='text-slate-900 text-3xl font-medium'>4</h3>
            </article>
            <article className='text-center'>
              <h2 className='text-slate-500 text-lg font-medium'>Questions</h2>
              <h3 className='text-slate-900 text-3xl font-medium'>4</h3>
            </article>
            <article className='text-center'>
              <h2 className='text-slate-500 text-lg font-medium'>Points</h2>
              <h3 className='text-slate-900 text-3xl font-medium'>4</h3>
            </article>
          </section>
          <section className='flex gap-2 pr-4'>
            <Button label='Preview' type='outline' />
            <Button label='Edit' />
          </section>
        </section>
      </header>

      <section className='h-full bg-gray-100 py-8'>
        <PreviewQuestion title='Lorem Ipsum' points={1} percentage={25} question='Round 619,348 to the nearest ten thousand.' correctAnswer='620000' />
      </section>


    </main>
  );
}

export default AssignmentPreview;