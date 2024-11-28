import React from 'react';
import { Button, Checkbox, Input, Title } from '../../design-system';


const AssignmentSettings = () => {

  return (
    <main className='p-4 pl-10 flex flex-col gap-4'>
      <Title>Assignment Settings</Title>
      <section className='flex gap-[6rem]'>
        <section className='w-5/12 flex flex-col gap-4'>
          <Input label='Name' placeholder='Great Assignment' />
          <section className='flex justify-between gap-4'>
            <Input label='Start Date' placeholder='10/10/2024' />
            <Input label='Start Time' placeholder='12pm EST' />
          </section>
          <section className='flex justify-between gap-4'>
            <Input label='End Date' placeholder='10/12/2024' />
            <Input label='End Time' placeholder='12pm EST' />
          </section>
          <label
            className='block mb-2 text-sm font-medium text-gray-700'
          >
            Select a Label
          </label>
          <section className='flex flex-col gap-4'>
            <Checkbox label='Homework' />
            <Checkbox label='Quiz' />
          </section>
        </section>
        <aside className='w-5/12'>
          <label
            className='block mb-2 text-sm font-medium text-slate-900'
          >
            Features
          </label>
          <section className='mb-4'>
            <Checkbox label='Shuffle question order' />
            <p className='ml-7 mt-2 text-slate-700 text-sm font-normal'>Randomize the order of questions in your assignment</p>
          </section>
          <section className='mb-4'>
            <Checkbox label='Enable Review Center' />
            <p className='ml-7 mt-2 text-slate-700 text-sm font-normal'>Help your students prepare for this assignment. Review items will be auto-generated from topics selected in this assignment (topics from custom questions will not be included). Students will receive access 14 days before the assignment begins.</p>
          </section>
          <section className='mb-4'>
            <Checkbox label='Show timer' />
            <p className='ml-7 mt-2 text-slate-700 text-sm font-normal'>Show timer while your students are working on this assignment</p>
          </section>
          <section className='mb-4'>
            <Checkbox label='Allow multiple attempts' />
            <p className='ml-7 mt-2 text-slate-700 text-sm font-normal'>Choose how many times a student can retake this assignment. Their grade will be the best score of attempts taken.</p>
          </section>

          <section className='ml-7'>
          <Input label='Number of Tries' type='number' min={1} max={15} placeholder={1} width='w-1/4' />
          </section>
          

          <label
            className='block mb-2 text-sm font-medium text-slate-900'
          >
            When a student completes this assignment, show:
          </label>
          <section className='flex flex-col gap-2'>
            <Checkbox label='Grades only' />
            <Checkbox label='Grades + correct / incorrect answers' />
            <Checkbox label='Grades + correct / incorrect answers + answer explanations' />
          </section>
        </aside>
      </section>
      <section className='flex justify-end gap-2 pr-4 pb-2'>
        <Button label='Save' />
        <Button label='Cancel' type='outline' />
      </section>

    </main>
  );
}

export default AssignmentSettings;