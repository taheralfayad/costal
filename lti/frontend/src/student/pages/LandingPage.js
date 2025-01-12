import React from 'react';
import { Title } from '../../design-system';
import CourseInfo from '../../instructor/components/CourseInfo';
import AlertCircle from '../../assets/alert-circle.svg';
import CheckCircle from '../../assets/check-circle.svg';
import ArrowCircle from '../../assets/arrow-circle.svg';

const LandingPage = () => {
  return (
    <main>
      <header className='bg-emerald-400 p-8 flex flex-col gap-2 pl-10'>
        <Title white>Welcome to COSTAL</Title>
        <h2 className='text-white text-xl font-semibold'>MAC 2313 - Calculus 3 Fall 2024 M04</h2>
        <CourseInfo white />
      </header>
      <section>
        <h3 className='text-xl font-medium text-slate-900 ml-8 py-4'>Schedule</h3>
        <section className='bg-white rounded-xl border border-slate-300 mx-8'>
          <table className='w-full text-center'>
            <tr className='border-b border-slate-300 text-slate-700 text-sm font-medium'>
              <td className='p-4 text-left w-4/5'>Topic</td>
              <td className='align-middle text-center'><article className='flex items-center justify-center gap-2 mr-8'>
                <AlertCircle />
                <p className='underline decoration-dashed decoration-red-500 text-red-500 underline-offset-4 text-sm'>Feb 29</p>
              </article></td>
              <td><CheckCircle /></td>
            </tr>
            <tr className='border-b border-slate-300 text-slate-700 text-sm font-medium'>
              <td className='p-4 text-left'>Topic</td>
              <td className='underline decoration-dashed underline-offset-4'>Feb 29</td>
              <td><ArrowCircle  /></td>
            </tr>

            <tr className='text-slate-700 text-sm font-medium'>
              <td className='p-4 text-left'>Topic</td>
              <td className='underline decoration-dashed underline-offset-4'>Feb 29</td>
              <td><ArrowCircle /></td>
            </tr>
          </table>
        </section>
      </section>
    </main>
  );
};

export default LandingPage;