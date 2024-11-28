import React from 'react';
import { Button, Checkbox, Input, Title } from '../../design-system';

const CreateAssignment = () => {
  return (
    <div>
      <main className='p-6 pl-10 w-1/2 flex flex-col gap-4'>
        <Title>Create Assignment</Title>
        <Input label='Name' placeholder='Great Assignment' />
        <section className='flex justify-between'>
          <Input label='Start Date' placeholder='10/10/2024' />
          <Input label='Start Time' placeholder='12pm EST' />
        </section>
        <section className='flex justify-between'>
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

        <section className='h-20 rounded-[10px] border border-slate-300 flex items-center justify-center gap-4'>
          <label
            className='block text-sm font-medium text-gray-700 text-center'
          >Import questions and settings from another assignment</label>
          <Checkbox label='' />
        </section>
      </main>
      <section className='flex justify-end gap-2 pr-2'>
        <Button label='Create' />
        <Button label='Cancel' type='outline' />
      </section>
    </div>
  );
}

export default CreateAssignment;