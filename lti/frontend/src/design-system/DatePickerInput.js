import React, { useState, useEffect, useRef } from 'react';
import ChevronLeft from '../assets/chevron-left.svg';
import ChevronRight from '../assets/chevron-right.svg';
import Button from './Button';

const DatePickerInput = ({ label = 'Input', placeholder = 'Pick a date', value, onChange, id, position }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(value || '');
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const daysContainerRef = useRef(null);
    const datepickerContainerRef = useRef(null);

    useEffect(() => {
        if (daysContainerRef.current) {
            renderCalendar();
        }
    }, [currentDate, isCalendarOpen]);

    useEffect(() => {
        onChange(selectedDate)
    }, [selectedDate]);

    const renderCalendar = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const daysInPrevMonth = new Date(year, month, 0).getDate();
    
        const daysContainer = daysContainerRef.current;
        daysContainer.innerHTML = '';
    
        for (let i = firstDayOfMonth - 1; i >= 0; i--) {
          const dayDiv = document.createElement('div');
          dayDiv.className = 'flex h-[38px] w-[38px] items-center justify-center rounded-[7px] text-slate-400 mb-2';
          dayDiv.textContent = daysInPrevMonth - i;
          daysContainer.appendChild(dayDiv);
        }
    
        for (let i = 1; i <= daysInMonth; i++) {
          const dayDiv = document.createElement('div');
          const currentDateValue = `${month + 1}/${i}/${year}`;
          dayDiv.className = 'flex h-[38px] w-[38px] items-center justify-center rounded-[7px] border-[.5px] border-transparent hover:text-slate-900 hover:bg-gray-100 text-slate-900 mb-2';
    
          if (currentDateValue === selectedDate) {
            dayDiv.classList.add('bg-emerald-400', 'text-white');
          }
    
          dayDiv.textContent = i;
          dayDiv.addEventListener('click', () => {
            setSelectedDate(currentDateValue);
            onChange(currentDateValue);
            daysContainer.querySelectorAll('div').forEach((d) => d.classList.remove('bg-emerald-400', 'text-white'));
            dayDiv.classList.add('bg-emerald-400', 'text-white');
          });
          daysContainer.appendChild(dayDiv);
        }
    };

    const handleToggleCalendar = (event) => {
        event.stopPropagation();
        setIsCalendarOpen((prev) => !prev);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (datepickerContainerRef.current && !datepickerContainerRef.current.contains(event.target)) {
                setIsCalendarOpen(false);
            }
        };

        document.addEventListener('click', handleClickOutside);
        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, []);

    return (
        <div className='relative w-full mb-4'>
            <label htmlFor={id} className='block mb-2 text-sm font-medium text-gray-700'>
                {label}
            </label>
            <input
                id={id}
                type='text'
                placeholder={placeholder}
                className='h-12 w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-gray-600 focus:outline-none focus:ring-blue-500 focus:border-blue-500'
                value={selectedDate}
                readOnly
                onClick={handleToggleCalendar}
            />
            {isCalendarOpen && (
                <section className={`absolute z-50 ${position}`}>
                    <section className='mx-auto w-full'>
                        <section
                            ref={datepickerContainerRef}
                            className='flex w-full flex-col rounded-xl bg-white p-4 shadow'
                        >
                            <nav className='flex items-center justify-between pb-2'>
                                <button
                                    className='flex h-[38px] w-[38px] cursor-pointer items-center justify-center rounded-[7px] border bg-gray-100 border-gray-300 text-black hover:border-emerald-400 hover:bg-emerald-400 fill-black hover:fill-white'
                                    onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
                                >
                                    <ChevronLeft />
                                </button>

                                <span className='text-base text-center font-medium capitalize'>
                                    {currentDate.toLocaleDateString('en-US', {
                                        month: 'long',
                                        year: 'numeric',
                                    })}
                                </span>

                                <button
                                    className='group flex h-[38px] w-[38px] cursor-pointer items-center justify-center rounded-[7px] border bg-gray-100 border-gray-300 hover:border-emerald-400 hover:bg-emerald-400 fill-black hover:fill-white'
                                    onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
                                >
                                    <ChevronRight />
                                </button>
                            </nav>

                            <section ref={daysContainerRef} className='grid grid-cols-7 text-center text-sm font-medium'></section>
                        </section>
                    </section>
                </section>
            )}
        </div>
    );
};

export default DatePickerInput;
