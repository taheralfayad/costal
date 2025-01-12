import React, { useState, useEffect, useRef } from 'react';
import ChevronLeft from '../assets/chevron-left.svg';
import ChevronRight from '../assets/chevron-right.svg';
import Button from './Button';

const DatePicker = ({ isCalendarOpen, handleCalendarOpen, position }) => {
  if (!isCalendarOpen) return null;
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return `${today.getMonth() + 1}/${today.getDate()}/${today.getFullYear()}`;
  });
  const daysContainerRef = useRef(null);
  const datepickerContainerRef = useRef(null);

  useEffect(() => {
    if (daysContainerRef.current) {
      renderCalendar();
    }
  }, [currentDate]);

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
      dayDiv.className =
        'flex h-[38px] w-[38px] items-center justify-center rounded-[7px] text-slate-400 mb-2';
      dayDiv.textContent = daysInPrevMonth - i;
      daysContainer.appendChild(dayDiv);
    }

    for (let i = 1; i <= daysInMonth; i++) {
      const dayDiv = document.createElement('div');
      const currentDateValue = `${month + 1}/${i}/${year}`;
      dayDiv.className =
        'flex h-[38px] w-[38px] items-center justify-center rounded-[7px] border-[.5px] border-transparent hover:text-slate-900 hover:bg-gray-100 text-slate-900 mb-2';

      if (currentDateValue === selectedDate) {
        dayDiv.classList.add('bg-emerald-400', 'text-white');
      }

      dayDiv.textContent = i;
      dayDiv.addEventListener('click', () => {
        setSelectedDate(currentDateValue);
        daysContainer
          .querySelectorAll('div')
          .forEach((d) => d.classList.remove('bg-emerald-400', 'text-white'));
        dayDiv.classList.add('bg-emerald-400', 'text-white');
      });
      daysContainer.appendChild(dayDiv);
    }

    const totalCells = firstDayOfMonth + daysInMonth;
    const remainingCells = 7 - (totalCells % 7 === 0 ? 7 : totalCells % 7);
    for (let i = 1; i <= remainingCells; i++) {
      const dayDiv = document.createElement('div');
      dayDiv.className =
        'flex h-[38px] w-[38px] items-center justify-center rounded-[7px] text-slate-400 mb-2';
      dayDiv.textContent = i;
      daysContainer.appendChild(dayDiv);
    }
  };



  const handlePrevMonth = () => {
    setCurrentDate(
      (prevDate) => new Date(prevDate.setMonth(prevDate.getMonth() - 1)),
    );
  };

  const handleNextMonth = () => {
    setCurrentDate(
      (prevDate) => new Date(prevDate.setMonth(prevDate.getMonth() + 1)),
    );
  };

  const handleApply = () => {
    if (selectedDate) {
      handleCalendarOpen()
    }
  };

  const handleCancel = () => {
    setSelectedDate(null);
    handleCalendarOpen()
  };

  return (
    <section className={`absolute z-50 ${position}`}>
      <section className='mx-auto w-full max-w-[500px]'>
        <section
          ref={datepickerContainerRef}
          id='datepicker-container'
          className='flex w-full flex-col rounded-xl bg-white p-4 shadow'
        >
          <nav className='flex items-center justify-between pb-2'>
            <button
              id='prevMonth'
              className='flex h-[38px] w-[38px] cursor-pointer items-center justify-center rounded-[7px] border bg-gray-100 border-gray-300 text-black hover:border-emerald-400  hover:bg-emerald-400 fill-black hover:fill-white'
              onClick={handlePrevMonth}
            >
              <ChevronLeft />
            </button>

            <span
              id='currentMonth'
              className='text-lg font-medium capitalize'
            >
              {currentDate.toLocaleDateString('en-US', {
                month: 'long',
                year: 'numeric',
              })}
            </span>

            <button
              id='nextMonth'
              className='group flex h-[38px] w-[38px] cursor-pointer items-center justify-center rounded-[7px] border bg-gray-100 border-gray-300 hover:border-emerald-400 hover:bg-emerald-400 fill-black hover:fill-white'
              onClick={handleNextMonth}
            >
              <ChevronRight />
            </button>
          </nav>
          <header className='grid grid-cols-7 justify-between text-center pb-2 pt-4 text-sm font-medium capitalize'>
            <span className='flex h-[38px] w-[38px] items-center justify-center text-slate-600'>
              Su
            </span>

            <span className='flex h-[38px] w-[38px] items-center justify-center text-slate-600'>
              Mo
            </span>

            <span className='flex h-[38px] w-[38px] items-center justify-center text-slate-600'>
              Tu
            </span>

            <span className='flex h-[38px] w-[38px] items-center justify-center text-slate-600'>
              We
            </span>

            <span className='flex h-[38px] w-[38px] items-center justify-center text-slate-600'>
              Th
            </span>

            <span className='flex h-[38px] w-[38px] items-center justify-center text-slate-600'>
              Fr
            </span>

            <span className='flex h-[38px] w-[38px] items-center justify-center text-slate-600'>
              Sa
            </span>
          </header>

          <section
            ref={daysContainerRef}
            id='days-container'
            className='grid grid-cols-7 text-center text-sm font-medium'
          >
          </section>

          <section className='flex items-center justify-center gap-4'>
            <Button type='black' onClick={handleCancel} label='Remove' />
            <Button onClick={handleApply} label='Done' />
          </section>
        </section>
      </section>
    </section>
  );
}

export default DatePicker;