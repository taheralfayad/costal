import React from 'react';
import { Button, Input, Title } from '../../design-system';
import Toggle from '../../design-system/Toggle';
import ChapterDropdown from '../components/ChapterDropdown';
import StatsCard from '../components/StatsCard';
import Topic from '../components/Topic';


const SelectObjectives = () => {

  return (
    <main className='p-4 pl-10 flex flex-col gap-4'>
      <Title>Select Objectives</Title>

      <section className='flex justify-between items-top'>
        <section className='w-3/5'>
          <ChapterDropdown chapterTitle='Chapter 1:'>

            <Topic chapter='1.1 Lorem Ipsum' title='Lorem Ipsum' description='Lorem Ipsum' />
          </ChapterDropdown>
          <ChapterDropdown chapterTitle='Chapter 2:'>

            <Topic chapter='2.1 Lorem Ipsum' title='Lorem Ipsum' description='Lorem Ipsum' />
          </ChapterDropdown>
          <ChapterDropdown chapterTitle='Chapter 3:'>

            <Topic chapter='3.1 Lorem Ipsum' title='Lorem Ipsum' description='Lorem Ipsum' />
          </ChapterDropdown>


          <ChapterDropdown chapterTitle='Chapter 4:'>
            <Topic chapter='4.1 Linear Regression' title='Gradient Descent' description='Lorem Ipsum' />

            <Topic chapter='4.2 Logistic Regression' title='Lorem Ipsum' description='Lorem Ipsum' />
          </ChapterDropdown>
        </section>
        <aside className='w-1/4 h-60 border border-slate-300 rounded-lg shadow-sm p-6'>
          <Input label='Questions Per Objective' type='number' min={1} max={15} />
          <section className='flex justify-between items-top'>
            <Toggle />
            <p className='w-4/5 text-slate-900 text-sm font-medium pl-1'>Toggle Only Objectives Not Assigned</p>
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

export default SelectObjectives;