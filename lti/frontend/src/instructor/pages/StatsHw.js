import React from 'react';
import Calendar from '../../assets/calendar.svg'
import Clock from '../../assets/alarmclock.svg'
import Target from '../../assets/target.svg'
import Files from '../../assets/files.svg'
import StatsHeader from '../components/StatsHeader';
import InfoCard from '../components/InfoCard';
import ProgressBar from '../components/ProgressBar';

const StatsHw = () => {
  const data = [
    { name: 'Complete', value: 6, color: '#6ee7b7' },
    { name: 'In Progress', value: 6, color: '#fef08a' },
    { name: 'Struggling', value: 1, color: '#f87171' },
    { name: 'Not Started', value: 2, color: '#94a3b8' },
  ];
  return (
    <main>
      <StatsHeader title='Topic 1' description='Feb 11 - Feb 27' icon={<Calendar />} />
      <section className='bg-[#f8f8f8] h-[100vh] p-6 pl-10 flex flex-col gap-6'>

        <section className='flex justify-around'>
          <InfoCard icon={<Target />} title='Avg Mastery' description='76%' long={false} />
          <InfoCard icon={<Files />} title='Avg Questions' description='10' long={false} />
          <InfoCard icon={<Clock />} title='Avg Time' description='24m' long={false} />
        </section>

        <h3 className='text-slate-900 text-lg font-medium ml-8'>Overall Status</h3>

        <ProgressBar data={data} />


        <h3 className='text-slate-900 text-lg font-medium ml-8'>Students</h3>
        <section className='bg-white rounded-xl border border-slate-300 mx-8'>
          <table className='w-full text-center'>
            <tr className='border-b border-slate-300 text-slate-700 text-sm font-medium'>
              <th className='p-4 text-left'>First Name</th>
              <th>Last Name</th>
              <th>Last active</th>
              <th >Work time</th>
              <th>Mastery on Due Assignments</th>
              <th>Struggling Assignments</th>
            </tr>
            <tr className='border-b border-slate-300 text-slate-700 text-sm font-medium'>
              <td className='p-4 text-left'>Alice</td>
              <td>Doe</td>
              <td>7 days</td>
              <td>3h 40m</td>
              <td>80%</td>
              <td>0</td>
            </tr>
            <tr className='border-b border-slate-300 text-slate-700 text-sm font-medium'>
              <td className='p-4 text-left'>Bob</td>
              <td>Doe</td>
              <td>11 days</td>
              <td>1h 10m</td>
              <td>74%</td>
              <td>4</td>
            </tr>
            <tr className='text-slate-700 text-sm font-medium'>
              <td className='p-4 text-left'>Clarice</td>
              <td>Doe</td>
              <td>12 days</td>
              <td>40m</td>
              <td>76%</td>
              <td>1</td>
            </tr>
          </table>
        </section>


      </section>
    </main>
  );
};

export default StatsHw;