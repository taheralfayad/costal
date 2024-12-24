import React from 'react';
import Arrow from '../../assets/arrow-left.svg';
import Menu from '../../assets/menu-alt.svg';
import { Title } from '../../design-system';
import Loader from '../components/Loader';
import MultipleChoice from '../components/MultipleChoice';
import ProgressBar from '../components/ProgressBar';
import Video from '../components/Video';
import Writing from '../components/Writing';

const Assignment = () => {
  return (
    <main>
      <header className='p-6 pl-10 flex flex-col gap-4'>
        <section className='flex gap-2 ml-8'>
          <Arrow className='w-5 h-5' />
          <p>Back to Assignment Overview</p>
        </section>
        <section className='flex gap-2 items-center'>
          <Menu />
          <Title>1.1 Understanding How Sum Works</Title>
        </section>
        <ProgressBar percentage={20} />
      </header>

      <section className='bg-[#f8f8f8] h-screen pt-8'>
        <MultipleChoice title='Lorem Ipsum' question='Choose the left and right options' options={['Wrong option', 'Right option', 'Wrong option', 'Left option']} />
      </section>
    </main>
  );
};

export default Assignment;