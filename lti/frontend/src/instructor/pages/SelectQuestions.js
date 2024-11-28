import React from 'react';
import { Button, Title } from '../../design-system';
import NavCard from '../components/NavCard';
import SelectQuestion from '../components/SelectQuestion'

const SelectQuestions = () => {

  return (
    <main className='p-6 pl-10 flex flex-col gap-4'>
      <Title>Select Questions</Title>
      <NavCard chapter='Chapter 4' title='Gradient Descent' description='Lorem Ipsum' />
      <SelectQuestion question='Round 619,348 to the nearest ten thousand.' correctAnswer='620000' />
      <SelectQuestion question='Round 619,348 to the nearest ten thousand.' correctAnswer='620000' />

      <section className='flex justify-end gap-2 pr-2'>
        <Button label='Done' />
      </section>
    </main>
  );
}

export default SelectQuestions;