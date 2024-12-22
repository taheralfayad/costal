import React from 'react';
import { Badge, Button, CircularProgressChart, Title } from '../../design-system';
import Arrow from '../../assets/arrow-left.svg';
import StarDark from '../../assets/star-dark.svg';
import Menu from '../../assets/menu-alt.svg';
import Cat from '../../assets/cat.svg';
import TaskSummary from '../components/TaskSummary';
import Objective from '../components/Objective';

const AssignmentLanding = ({ percentageTotal }) => {
    const renderButtonLabel = () => {
        if (percentageTotal == 0) {
            return 'Get Started'
        }
        else if (percentageTotal == 100) {
            return 'Practice'
        }
        else {
            return 'Keep Going'
        }
    }

    const renderStatus = () => {
        if (percentageTotal == 0) {
            return 'Not Started'
        }
        else if (percentageTotal == 100) {
            return 'Completed'
        }
        else {
            return `${percentageTotal}% Mastery`
        }
    }

    const renderThirdTaskSummary = () => {
        if (percentageTotal == 0) {
            return <TaskSummary title='Work Estimate' description='12 questions minimum'
                nextLine='25 questions on average'
            />
        }
        else if (percentageTotal == 100) {
            return <TaskSummary title='Grade' description='100% Credit'
            />
        }
        else {
            return <></>
        }
    }

    const renderActivity = () => {
        if (percentageTotal == 0) {
            return <section className='flex flex-col justify-center items-center gap-6 p-6'><Cat />
                <h4 className='text-slate-800 text-xl font-medium'>No activity yet</h4></section>
        }
        else {
            return <section className='flex flex-col w-full'>


            <section className='flex w-full justify-between items-center border-b border-slate-300 p-6'>
                <section className='flex gap-4'>
                    <StarDark />
                    <section>
                        <h4 className='text-slate-900 text-base font-medium mb-2'>Assigned Activity</h4>
                        <p className='text-slate-700 text-xs font-medium'>Material from Assigned Objectives</p>
                    </section>

                </section>
                <p className='text-slate-900 text-base font-medium'>10</p>
            </section>
            <section className='flex w-full justify-between items-center p-4 px-8'>
                <p className='text-slate-600 text-base font-medium'>Last active a minute ago</p>
                <Button label='View Activity Details' type='outline' className='px-7 py-3' />
            </section>
        </section>
        }

    }

    const subObjectives = [
        {
            title: 'Objective 1.1.1',
            percentage: 10
        },
        {
            title: 'Objective 1.1.2',
            percentage: 100
        }
    ]
    return (
        <main >
            <header className='p-6 pl-10 flex flex-col gap-4'>
                <section className='flex gap-2 ml-8'>
                    <Arrow className='w-5 h-5' />
                    <p>Back to Course</p>
                </section>
                <section className='flex gap-2 items-center'>
                    <Menu />
                    <Title>Great Assignment</Title>
                </section>
                <section className='ml-8 flex flex-col gap-4'>
                    <Badge title='Homework' />

                    <section className={`flex justify-between ${(percentageTotal === 100 || percentageTotal === 0) ? 'w-3/4' : 'w-1/2'}`}>
                        <TaskSummary title='Due' description='October 11, 2024'
                            nextLine='12:00pm EST'
                        />
                        <TaskSummary title='Status' description={renderStatus()}
                        />
                        {renderThirdTaskSummary()}
                    </section>

                    <section>
                        <Button label={renderButtonLabel()} className='px-7 py-3' />
                    </section>
                </section>
            </header>

            <section className='bg-[#f8f8f8] p-6'>
                <h3 className='text-slate-900 text-lg font-medium ml-12 pb-4'>Activity</h3>
                <section className='bg-white rounded-xl border border-slate-300 mx-8'>
                    {renderActivity()}
                </section>

                <h3 className='text-slate-900 text-lg font-medium ml-12 py-4'>Objectives</h3>
                <section className='bg-white rounded-xl border border-slate-300 mx-8'>
                    <Objective title='Objective 1.1' estimateQuestions='1-2 Questions' subObjectives={subObjectives} />
                </section>

            </section>
        </main>
    );
};

export default AssignmentLanding;