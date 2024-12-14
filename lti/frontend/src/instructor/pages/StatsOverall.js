import React, { useState } from 'react';
import { Button, Title } from '../../design-system';
import CourseInfo from '../components/CourseInfo';
import InfoCard from '../components/InfoCard';
import PercentageDisplay from '../components/PercentageDisplay';
import Friends from '../../assets/friends.svg'
import Flag from '../../assets/flag.svg'
import Laptop from '../../assets/laptop.svg'
import PieChartCard from '../components/PieChartCard';

const StatsOverall = () => {
    const [activeTab, setActiveTab] = useState('coursework');

    const handleTabClick = (tab) => {
        setActiveTab(tab);
    };

    const dataMastery = [
        { name: 'Above 90%', value: 6, color: '#818CF8' },
        { name: '60 to 90%', value: 7, color: '#0D9488' },
        { name: 'Below 60%', value: 2, color: '#f87171' },
    ];

    const dataActivity = [
        { name: 'Active', value: 0, color: '#0D9488' },
        { name: 'Inactive', value: 15, color: '#f87171' },
    ];

    return (
        <main>
            <header className='flex flex-col gap-2 pt-6 pl-10'>
                <Title>MAC 2313 - Calculus 3 Fall 2024 M04</Title>
                <CourseInfo />
                <nav className='flex pt-6'>
                    <button
                        onClick={() => handleTabClick('coursework')}
                        className={`px-4 py-2 transition-colors duration-200 font-medium focus:outline-none ${activeTab === 'coursework' ? 'text-slate-900 border-b border-black' : 'text-slate-600'
                            }`}
                    >
                        Coursework
                    </button>
                    <button
                        onClick={() => handleTabClick('students')}
                        className={`px-4 py-2 font-medium transition-colors duration-200 focus:outline-none ${activeTab === 'students' ? 'text-slate-900 border-b border-black' : 'text-slate-600'
                            }`}
                    >
                        Students
                    </button>
                </nav>
            </header>

            {activeTab === 'coursework' && (
                <section className='bg-[#f8f8f8] h-[100vh] p-6 pl-10'>
                    <section className='flex justify-around items-end'>
                        <PercentageDisplay title='Homework Mastery' description='Average for 5 out of 10' percentage={85} />
                        <PercentageDisplay title='Quiz Grade' description='Average for 4 out of 4' percentage={75} />
                        <Button type='outline' label='Export Data' />
                    </section>
                    <section className='bg-white rounded-xl border border-slate-300 mt-12 mx-8'>
                        <table className='w-full text-center'>
                            <tr className='border-b border-slate-300 text-slate-700 text-sm font-medium '>
                                <th className='p-4 w-3/5 text-left'>Course Outline</th>
                                <th>Due</th>
                                <th>Avg Mastery</th>
                                <th>Struggling</th>
                            </tr>
                            <tr className='border-b border-slate-300 text-slate-700 text-sm font-medium'>
                                <td className='p-4 text-left'>Topic</td>
                                <td>Feb 27</td>
                                <td>80%</td>
                                <td>1</td>
                            </tr>
                            <tr className='border-b border-slate-300 text-slate-700 text-sm font-medium'>
                                <td className='p-4 text-left'>Topic</td>
                                <td>Feb 29</td>
                                <td>74%</td>
                                <td>--</td>
                            </tr>
                            <tr className='text-slate-700 text-sm font-medium'>
                                <td className='p-4 text-left'>Topic</td>
                                <td>March 2</td>
                                <td>76%</td>
                                <td>--</td>
                            </tr>
                        </table>
                    </section>
                </section>
            )}

            {activeTab === 'students' && (
                <div className='bg-[#f8f8f8] h-[100vh] p-6 flex flex-col gap-6 px-16'>
                    <section className='flex justify-between'>
                        <InfoCard icon={<Friends />} title='Total Students' description='15' />
                        <InfoCard icon={<Flag />} title='Struggling Students' description='6' />
                    </section>

                    <div className='flex justify-between'>

                        <PieChartCard
                            title='Assignment Mastery'
                            data={dataMastery}
                            label='5 due of 10 assignments'
                            icon={<Friends />}
                        />

                        <PieChartCard
                            title='Activity'
                            data={dataActivity}
                            label='Past 7 days'
                            icon={<Laptop />}
                        />
                    </div>

                    <section className='bg-white rounded-xl border border-slate-300 mt-8'>
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
                </div>
            )}

        </main>
    );
};

export default StatsOverall;