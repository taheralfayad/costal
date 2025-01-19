import React, {useEffect} from 'react';
import { Button, Checkbox, Input, Title } from '../../design-system';
import StatsCard from '../components/StatsCard';
import Pencil from '../../assets/pencil-line.svg'


const EditAssignment = () => {

  return (
    <main className='p-4 pl-10 flex flex-col gap-4'>
      <Title>Edit an Assignment</Title>
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
        <aside className='w-5/12 border border-slate-300 rounded-lg shadow-sm p-8 flex flex-col gap-2'>
          <header className='flex justify-between items-center '>
            <h2 className='text-slate-950 text-lg font-semibold'>Objectives</h2>
            <Button label='Edit' icon={<Pencil />} />
          </header>
          <section>
            <h3 className='text-slate-950 text-base font-semibold'>Objective</h3>
            <section className='text-slate-600 text-sm font-medium pl-3 flex flex-col gap-2 pt-2'>
            <p>Lorem Inpsum</p>
            <p>Lorem Inpsum</p>
            </section>
            
          </section>
        </aside>
      </section>

      <section className='flex justify-between items-center mt-6'>
        <StatsCard objectives={4} questions={4} points={4} />
        <section className='flex justify-end gap-2 pr-4'>
          <Button label='Save' />
          <Button label='Cancel' type='outline' />
        </section>
      </section>
    </main>
  );
}

export default EditAssignment;