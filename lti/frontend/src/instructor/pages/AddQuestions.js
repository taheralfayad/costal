import React from 'react';
import { Badge, Button, Title } from '../../design-system';
import Writing from '../../assets/writing.svg';
import CalendarIcon from '../../assets/calendar.svg';
import PlusIcon from '../../assets/plus.svg';
import PlusGIcon from '../../assets/plus-green.svg';


const AddQuestions = () => {
  return (
    <main className='p-6 pl-10 flex flex-col gap-4'>
      <Title>Great Assignment</Title>
      <Badge title='Homework' />
      <section className='flex'>
        <CalendarIcon />
        <article className='pl-2'>
          <p className='text-slate-600'>Starts on <b>October 10, 2024</b> at <b>12:00pm EST</b></p>
          <p className='text-slate-600'>Ends on <b>October 11, 2024</b> at <b>12:00pm EST</b></p>
        </article>
      </section>

      <section className='flex flex-col gap-4 justify-center items-center'>


        <Writing />
        <h2 className='text-slate-950 text-2xl font-semibold'>Add your first question</h2>
        <p className='text-slate-600 text-xl font-medium w-1/2 text-center'>Browse our library of questions or create your own. Any questions you create for this assignment will show up here</p>
        <section className='flex gap-4'>
          <Button label='Add a COSTAL question' icon={<PlusIcon />} />
          <Button label='Add custom question' type='outline' icon={<PlusGIcon />} />
        </section>
        <Button label='Search Open Source Libraries' type='gray' />
      </section>
    </main>
  );
}

export default AddQuestions;
