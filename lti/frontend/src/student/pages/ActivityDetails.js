import React, { useState } from 'react';
import XClose from '../../assets/x-close.svg';
import Check from '../../assets/check.svg';
import Menu from '../../assets/menu-alt.svg';
import Arrow from '../../assets/arrow-left.svg';
import { SearchBar, SquareButton, Title } from '../../design-system';
import ResultItem from '../components/ResultItem';


const ActivityDetails = () => {
  const [activeFilter, setActiveFilter] = useState('All');

  const data = [
    { type: 'text', status: 'correct', text: 'Lorem ipsum odor amet, consectetuer adipiscing elit. Torquent tortor sodales et nisi at. Euismod adipiscing penatibus praesent', time: '6 minutes ago' },
    { type: 'text', status: 'incorrect', text: 'Lorem ipsum odor amet, consectetuer adipiscing elit. Torquent tortor sodales et nisi at. Euismod adipiscing penatibus praesent', time: '7 minutes ago' },
    { type: 'instruction', status: 'neutral', text: 'Textbook Instruction', time: '8 minutes ago' },
    { type: 'text', status: 'incorrect', text: 'Lorem ipsum odor amet, consectetuer adipiscing elit. Torquent tortor sodales et nisi at. Euismod adipiscing penatibus praesent', time: '9 minutes ago' },
    { type: 'instruction', status: 'neutral', text: 'Video', time: '10 minutes ago' },
  ]

  const counts = {
    All: data.length,
    Instruction: data.filter((item) => item.type === 'instruction').length,
    Correct: data.filter((item) => item.status === 'correct').length,
    Incorrect: data.filter((item) => item.status === 'incorrect').length,
  }

  const filteredData = data.filter(
    (item) =>
      activeFilter === 'All' || (activeFilter === 'Instruction' && item.type === 'instruction') ||
      (activeFilter === 'Correct' && item.status === 'correct') ||
      (activeFilter === 'Incorrect' && item.status === 'incorrect')
  )

  const filters = [
    { label: 'All', icon: null },
    { label: 'Instruction', icon: <Menu className='h-5 w-5 mr-2' /> },
    { label: 'Correct', icon: <Check className='h-5 w-5 mr-2' /> },
    { label: 'Incorrect', icon: <XClose className='h-5 w-5 mr-2' /> },
  ]

  return (
    <main>
      <header className='h-40 p-6 pl-10 flex flex-col gap-2'>
      <p className='text-slate-800 text-sm font-medium ml-8'>1.1  Understanding How Sum Works</p>
      <section className='flex gap-2 items-center'>
      <Arrow />
        <Title>Activity Details</Title>
      </section>
      </header>

      <section className='bg-[#f8f8f8] p-6 h-screen'>
        <section className='mx-8 p-8 bg-white rounded-xl border border-slate-300'>
          <SearchBar />
          <nav className='flex mb-4'>
            {filters.map((filter, index) => (
              <SquareButton
                key={index}
                label={`${filter.label} (${counts[filter.label]})`}
                isActive={activeFilter === filter.label}
                onClick={() => setActiveFilter(filter.label)}
                icon={filter.icon}
                noBorder={index == 1 || index === 2}
              />
            ))}
          </nav>
          <section>
            {filteredData.map((item, index) => (
              <ResultItem
                key={index}
                type={item.type}
                status={item.status}
                text={item.text}
                time={item.time}
              />
            ))}
          </section>
        </section>
      </section>

    </main>
  );
};

export default ActivityDetails;
