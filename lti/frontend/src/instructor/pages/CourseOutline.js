import React, { useState } from 'react';
import { Button, Checkbox, Dropdown, Title } from '../../design-system';
import CourseInfo from '../components/CourseInfo';
import Dots from '../../assets/dots-vertical.svg'
import Menu from '../../assets/menu.svg'


const CourseOutline = () => {
    const [isOrdering, setOrdering] = useState(false)
    const rows = [
        { topic: 'Topic', start: 'Feb 11', end: 'Feb 27' },
        { topic: 'Topic', start: 'Feb 11', end: 'Feb 29' },
        { topic: 'Topic', start: 'Feb 29', end: 'Mar 2' },
    ]

    return (
        <main className='flex flex-col gap-4'>
            <header className='p-6 pl-10 flex items-center justify-between'>
                <article className='flex flex-col gap-2'>
                    <Title>MAC 2313 - Calculus 3 Fall 2024 M04</Title>
                    <CourseInfo />
                </article>
                <Button type='lightGreenOutline' label='Settings' />

            </header>
            <section className='bg-[#f8f8f8] h-[100vh]'>
                {isOrdering? <section className='flex justify-between items-center mt-16 mx-16'>
                    <section className='flex items-center gap-4'>
                        <Checkbox label='' />
                        <h2 className='text-slate-900 text-xl font-medium'>Course Outline</h2>
                    </section>
                    <section className='flex gap-4'>
                        <Button label='Save' onClick={() => setOrdering(!isOrdering)} />
                        <Button label='Cancel' onClick={() => setOrdering(!isOrdering)} type='outline' />
                        <Dropdown label='' width='w-44' margin={false} />
                    </section>
                </section> : <section className='flex justify-between items-center mt-16 mx-16'>
                    <section className='flex items-center gap-4'>
                        <Checkbox label='' />
                        <h2 className='text-slate-900 text-xl font-medium'>Course Outline</h2>
                    </section>
                    <section className='flex gap-4'>
                        <Button label='Add' />
                        <Button label='Edit Order' onClick={() => setOrdering(!isOrdering)} type='outline' />
                    </section>
                </section>}
                

                <section className='bg-white rounded-xl border border-slate-300 mt-6 mx-16'>
                    <table className='w-full'>
                        {rows.map((row, index) => (
                            <tr className='last:border-none border-b border-slate-300'>
                                <td className='w-5 p-4' >
                                    {isOrdering ? <Menu /> : <Checkbox label='' /> }
                                </td>
                                <td className='w-4/5 text-slate-700 text-sm font-medium'>{row.topic}</td>
                                <td className='w-1/5 pl-8 text-slate-700 text-sm font-medium'>{row.start} - {row.end}</td>
                                <td className='pr-6'><Dots /></td>
                            </tr>
                        ))}

                    </table>
                </section>


            </section>

        </main >
    );
};

export default CourseOutline;