import React from 'react';
import StatsHeader from '../components/StatsHeader';
import Clock from '../../assets/alarmclock.svg'
import Email from '../../assets/envelope.svg'
import Files from '../../assets/files.svg'
import InfoCard from '../components/InfoCard';
import PercentageDisplay from '../components/PercentageDisplay';

const StatsStudent = () => {
  return (
    <main>
      <StatsHeader title='Alice Doe' description='alice@ucf.edu' icon={<Email />} />
      <section className='bg-[#f8f8f8] h-[100vh] p-6 pl-10 flex flex-col gap-6'>
        <section className='flex justify-around'>
          <InfoCard icon={<Files />} title='Average Questions' description='10' />
          <InfoCard icon={<Clock />} title='Total Work Time' description='3h' />
        </section>
        <section className='flex justify-around'>
          <PercentageDisplay title='Homework Mastery' description='Average for 5 out of 10' percentage={85} long={true} />
          <PercentageDisplay title='Quiz Grade' description='Average for 4 out of 4' percentage={75} long={true} />
        </section>

        <section className='bg-white rounded-xl border border-slate-300 mt-8 mx-12'>
          <table className='w-full text-center'>
            <tr className='border-b border-slate-300 text-slate-700 text-sm font-medium'>
              <th className='p-4 w-3/5 text-left'>Course Outline</th>
              <th>Due</th>
              <th>Status</th>
              <th>Work Time</th>
              <th>Mastery</th>
            </tr>
            <tr className='border-b border-slate-300 text-slate-700 text-sm font-medium'>
              <td className='p-4 text-left'>Topic</td>
              <td>Feb 27</td>
              <td>In progress</td>
              <td>1h</td>
              <td>80%</td>
            </tr>
            <tr className='border-b border-slate-300 text-slate-700 text-sm font-medium'>
              <td className='p-4 text-left'>Topic</td>
              <td>Feb 29</td>
              <td>In progress</td>
              <td>1h</td>
              <td>74%</td>
            </tr>
            <tr className='text-slate-700 text-sm font-medium'>
              <td className='p-4 text-left'>Topic</td>
              <td>Mar 2</td>
              <td>Complete</td>
              <td>1h</td>
              <td>100%</td>
            </tr>
          </table>
        </section>
      </section>
    </main>
  );
};

export default StatsStudent;