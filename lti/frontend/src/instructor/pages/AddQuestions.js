import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Badge, Button, Title } from '../../design-system';
import Writing from '../../assets/writing.svg';
import CalendarIcon from '../../assets/calendar.svg';
import PlusIcon from '../../assets/plus.svg';
import PlusGIcon from '../../assets/plus-green.svg';


const AddQuestions = () => {
  const [assignment, setAssignment] = useState({});
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const { assignmentId } = useParams();

  const getAssignment = async () => {
    console.log(assignmentId)
    const response = await fetch(`/lti/api/assignments/get_assignment_by_id/${assignmentId}`);
    const data = await response.json();
    console.log(data);
    setAssignment(data);
    setStartDate(formatDate(data.start_date));
    setEndDate(formatDate(data.end_date));
  };

  useEffect(() => {
    getAssignment();
  }, []);

  const formatDate = (dateString) => {
    const options = { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric', 
      hour: 'numeric', 
      minute: 'numeric', 
      hour12: true, 
      timeZone: 'America/New_York'
    };
    return new Intl.DateTimeFormat('en-US', options).format(new Date(dateString));
  };

  return (
    <main className='p-6 pl-10 flex flex-col gap-4'>
      <Title>{assignment.name}</Title>
      <Badge title='Homework' />
      <section className='flex'>
        <CalendarIcon />
        <article className='pl-2'>
        <p className='text-slate-600'>Starts on <b>{startDate.split(' at ')[0]}</b> at <b>{startDate.split(' at ')[1]}</b></p>
        <p className='text-slate-600'>Ends on <b>{endDate.split(' at ')[0]}</b> at <b>{endDate.split(' at ')[1]}</b></p>
        </article>
      </section>

      <section className='flex flex-col gap-4 justify-center items-center'>


        <Writing />
        <h2 className='text-slate-950 text-2xl font-semibold'>Add your first question</h2>
        <p className='text-slate-600 text-xl font-medium w-1/2 text-center'>Browse our library of questions or create your own. Any questions you create for this assignment will show up here</p>
        <section className='flex gap-4'>
          <Button label='Add a COSTAL question' icon={<PlusIcon />} />
          <Button label='Add custom question' type='outline' icon={<PlusGIcon />} />
        </section>
        <Button label='Search Open Source Libraries' type='gray' />
      </section>
    </main>
  );
}

export default AddQuestions;
