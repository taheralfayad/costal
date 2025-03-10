import React, { useState } from 'react';
import Arrow from '../../assets/arrow-left.svg';
import Menu from '../../assets/menu-alt.svg';
import { Title } from '../../design-system';
import Answered from '../components/Answered';
import Loader from '../components/Loader';
import MultipleChoice from '../components/MultipleChoice';
import ProgressBar from '../components/ProgressBar';
import SideMenu from '../components/SideMenu';
import SingleChoice from '../components/SingleChoice';
import Textbook from '../components/Textbook';
import Video from '../components/Video';
import Writing from '../components/Writing';

const Assignment = () => {

  const [isMenuOpen, setMenuOpen] = useState(false)
  return (
    <main>
      <SideMenu isMenuOpen={isMenuOpen} />
      <section
        className={`flex-1 transition-all duration-300 ${isMenuOpen ? "ml-64" : "ml-0"
          }`}
      >
        <header className='p-6 pl-10 flex flex-col gap-4'>
          <section className='flex gap-2 ml-8'>
            <Arrow className='w-5 h-5' />
            <p>Back to Assignment Overview</p>
          </section>
          <section className='flex gap-2 items-center'>
            <span onClick={() => setMenuOpen(!isMenuOpen)}><Menu /></span>
            <Title>1.1 Understanding How Sum Works</Title>
          </section>
          <ProgressBar percentage={20} />
        </header>

        <section className='bg-[#f8f8f8] h-full py-8'>
          <Writing title='Lorem Ipsum' question='Choose the right option' placeholder='Lorem ipsum' />
        </section>
      </section>
    </main>

  );
};

export default Assignment;