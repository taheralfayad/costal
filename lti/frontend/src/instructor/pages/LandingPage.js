import React from 'react';
import { Button, Title } from '../../design-system';
import CircularProgressChart from '../components/CircularProgressChart';
import HomeworkGradesChart from '../components/HomeworkGradesChart';
import CourseInfo from '../components/CourseInfo';

const LandingPage = () => {
    const chartsData = [
        {
            percentage: 85,
            label: 'Homework Avg',
        },
        {
            percentage: 75,
            label: 'Quiz Avg',
        },
    ]

    return (
        <main className='p-6 pl-10 flex flex-col gap-8'>
            <header className='flex items-center justify-between'>
                <article className='flex flex-col gap-2'>
                    <Title>Welcome to COSTAL</Title>
                    <h2 className='text-slate-950 text-xl font-semibold'>MAC 2313 - Calculus 3 Fall 2024 M04</h2>
                    <CourseInfo />
                </article>
                <Button type='blackOutline' label='Settings' />
            </header>
            <section>

                <section className='flex items-center justify-between'>
                    <section className='w-3/5'>
                        <h3 className='text-2xl font-medium mb-4'>Course Outline</h3>
                        <section className='flex justify-around w-full'>
                            <article className='text-center'>
                                <h4 className='text-6xl font-normal'>10</h4>
                                <p className='text-lg font-medium'>Homeworks</p>
                            </article>
                            <article className='text-center'>
                                <h4 className='text-6xl font-normal'>4</h4>
                                <p className='text-lg font-medium'>Quiz</p>
                            </article>

                        </section>
                    </section>
                    <Button type='blackOutline' label='Manage' />
                </section>

            </section>
            <section className='flex gap-8 items-center'>
                <HomeworkGradesChart />
                <article className='flex gap-10'>
                    {chartsData.map((chart, index) => (
                        <CircularProgressChart
                            key={index}
                            percentage={chart.percentage}
                            label={chart.label}
                            colors={chart.colors}
                            size={chart.size}
                        />
                    ))}
                </article>
            </section>
        </main>
    );
};

export default LandingPage;
