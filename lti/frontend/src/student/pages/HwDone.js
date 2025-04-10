import React from 'react';
import Party from '../../assets/party.png';
import Background from '../../assets/background.png';

const HwDone = () => {
  return (
    <main className='relative bg-blue-700 w-screen h-screen  flex items-center justify-center'>
      <img src={Background} className='absolute inset-0 w-full h-full object-cover'/>
        <section className='relative z-10 text-white gap-6 flex flex-col items-center justify-center'>
          <img src={Party} className='w-1/6' />
          <h1 className='text-5xl font-medium'>You did it!</h1>
          <h2 className='text-4xl font-medium'>Your hard work paid off!</h2>
        </section>
      
    </main>
  );
};

export default HwDone;