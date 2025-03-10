import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Badge, Button, Title } from '../../design-system';
import LoadingPage from "../components/LoadingPage.js";
import ListOfQuestions from "../components/ListOfQuestions.js"
import Arrow from '../../assets/arrow-left.svg';
import Writing from '../../assets/writing.svg';
import CalendarIcon from '../../assets/calendar.svg';
import PlusIcon from '../../assets/plus.svg';
import PlusGIcon from '../../assets/plus-green.svg';


const AddQuestions = () => {
  const [assignment, setAssignment] = useState({});
  const [startDate, setStartDate] = useState('');
  const [questions, setQuestions] = useState([]);
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(true);
  const { assignmentId } = useParams();
  const navigate = useNavigate();

  const navigateToCreateQuestion = () => {
    navigate(`/lti/create_question/${assignmentId}`)
  }

  const getAssignment = async () => {
    try {
      const response = await fetch(`/lti/api/assignments/get_assignment_by_id/${assignmentId}`);
      const data = await response.json();
      setAssignment(data);
      console.log(data)
      setQuestions(data.questions);
      setStartDate(formatDate(data.start_date));
      setEndDate(formatDate(data.end_date));
    } catch (error) {
      console.log("Sorry, an error occured, please try again later!");
    } finally {
      setLoading(false);
    }
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


  if (loading) {
    return(<LoadingPage/>)
  }


  return (
    <main className='p-6 pl-10 flex flex-col gap-4'>
      <section className='flex flex-row gap-2'>
        <button onClick={() => navigate('/lti/course_outline/')}>
          <Arrow className='w-5 h-5' />
        </button>
        <Title>{assignment.name}</Title>
      </section>
      <Badge title='Homework' />
      <section className='flex'>
        <CalendarIcon />
        <article className='pl-2'>
        <p className='text-slate-600'>Starts on <b>{startDate.split(' at ')[0]}</b> at <b>{startDate.split(' at ')[1]}</b></p>
        <p className='text-slate-600'>Ends on <b>{endDate.split(' at ')[0]}</b> at <b>{endDate.split(' at ')[1]}</b></p>
        </article>
      </section>

      <section className={`${assignment.questions.length > 0 ? "flex flex-col gap-4" : "flex flex-col gap-4 justify-center items-center"}`}>
       {assignment.questions.length > 0 ? <ListOfQuestions questions={questions}/> :
        <span className='flex flex-col justify-center items-center'>
          <Writing />
          <h2 className='text-slate-950 text-2xl font-semibold'>Add your first question</h2>
          <p className='text-slate-600 text-xl font-medium w-1/2 text-center'>Create a question or use an LLM to generate one for you. Any questions you create for this assignment will show up here</p>
        </span>}
        <section className='flex gap-4'>
          <Button label='Add a question' icon={<PlusIcon />} onClick={() => navigateToCreateQuestion()}/>
          <Button label='Add an LLM generated question' type='outline' icon={<PlusGIcon />} />
        </section>
      </section>
    </main>
  );
}

export default AddQuestions;
