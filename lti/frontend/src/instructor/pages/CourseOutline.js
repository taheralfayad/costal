import React, { useState } from 'react';
import { Button, Checkbox, DatePicker, Dropdown, Title } from '../../design-system';
import CourseInfo from '../components/CourseInfo';

import Menu from '../../assets/menu.svg'
import DropdownMenu from '../components/DropdownMenu';


const CourseOutline = () => {
    const [isOrdering, setOrdering] = useState(false)
    const rows = [
        { topic: 'Topic', start: 'Feb 11', end: 'Feb 27' },
        { topic: 'Topic', start: 'Feb 11', end: 'Feb 29' },
        { topic: 'Topic', start: 'Feb 29', end: 'Mar 2' },
    ]
    const [allChecked, setAllChecked] = useState(false);
    const [checkedRows, setCheckedRows] = useState(Array(rows.length).fill(false));
    const [isStartDateOpen, setStartDateOpen] = useState(false)
    const [isEndDateOpen, setEndDateOpen] = useState(false)

    const handleAllChecked = () => {
        setAllChecked(!allChecked);
        setCheckedRows(Array(rows.length).fill(!allChecked));
    };

    const handleRowChecked = (index) => {
        const updatedCheckedRows = [...checkedRows];
        updatedCheckedRows[index] = !updatedCheckedRows[index];
        setCheckedRows(updatedCheckedRows);

        if (updatedCheckedRows.includes(false)) {
            setAllChecked(false);
        } else {
            setAllChecked(true);
        }
    };

    const handleStartDate = () => {
        console.log('here')
        setStartDateOpen(!isStartDateOpen)
    }

    const handleEndDate = () => {
        console.log('here')
        setEndDateOpen(!isEndDateOpen)
    }


    const renderMenu = () => {
        if (isOrdering) {
            return (
                <section className='flex justify-between items-center mt-16 mx-16'>
                    <section className='flex items-center gap-4'>
                        <h2 className='text-slate-900 text-xl font-medium'>Course Outline</h2>
                    </section>
                    <section className='flex gap-4'>
                        <Button label='Save' onClick={() => setOrdering(!isOrdering)} />
                        <Button label='Cancel' onClick={() => setOrdering(!isOrdering)} type='outline' />
                        <Dropdown label='' width='w-44' margin={false} />
                    </section>
                </section>
            )
        }

        if (checkedRows.includes(true)) {
            return (
                <section className='flex justify-between items-center mt-16 mx-16'>
                    <section className='flex items-center gap-4'>
                        <Checkbox label='' checked={allChecked} onChange={handleAllChecked} />
                        <h2 className='text-slate-900 text-xl font-medium'>Course Outline</h2>
                    </section>
                    <section className='flex gap-4'>
                        <Button label='Edit Start Date' type='outline' onClick={handleStartDate} />
                        <Button label='Edit End Date' type='outline' onClick={handleEndDate} />
                    </section>

                    <DatePicker position='bottom-1 right-12' isCalendarOpen={isStartDateOpen} handleCalendarOpen={handleStartDate}  />
                    <DatePicker position='bottom-1 right-12' isCalendarOpen={isEndDateOpen} handleCalendarOpen={handleEndDate}  />
                </section>
            )
        }

        return (
            <section className='flex justify-between items-center mt-16 mx-16'>
                <section className='flex items-center gap-4'>
                    <Checkbox label='' checked={allChecked} onChange={handleAllChecked} />
                    <h2 className='text-slate-900 text-xl font-medium'>Course Outline</h2>
                </section>
                <section className='flex gap-4'>
                    <Button label='Add' />
                    <Button label='Edit Order' onClick={() => setOrdering(!isOrdering)} type='outline' />
                </section>
            </section>
        )
    }

    return (
        <main className='flex flex-col gap-4'>
            <header className='p-6 pl-10 flex items-center justify-between'>
                <article className='flex flex-col gap-2'>
                    <Title>{COURSE_NAME}</Title>
                    <CourseInfo />
                </article>
                <Button type='lightGreenOutline' label='Settings' />

            </header>
            <section className='bg-[#f8f8f8] h-[100vh]'>
                {renderMenu()}


                <section className='bg-white rounded-xl border border-slate-300 mt-6 mx-16'>
                    <table className='w-full'>
                        {rows.map((row, i) => (
                            <tr className='last:border-none border-b border-slate-300'>
                                <td className='w-5 p-4' >
                                    {isOrdering ? <Menu /> : <Checkbox label='' checked={checkedRows[i]} onChange={() => handleRowChecked(i)} />}
                                </td>
                                <td className='w-4/5 text-slate-700 text-sm font-medium'>{row.topic}</td>
                                <td className='w-1/5 pl-8 text-slate-700 text-sm font-medium'>{row.start} - {row.end}</td>
                                <td className='pr-6'><DropdownMenu /></td>
                            </tr>
                        ))}

                    </table>
                </section>


            </section>

        </main >
    );
};

export default CourseOutline;