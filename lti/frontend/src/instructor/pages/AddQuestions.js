import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Badge, Button, Title } from '../../design-system';
import LoadingPage from "../components/LoadingPage.js";
import QuestionList from "../components/QuestionList.js"
import Arrow from '../../assets/arrow-left.svg';
import Writing from '../../assets/writing.svg';
import CalendarIcon from '../../assets/calendar.svg';
import PlusIcon from '../../assets/plus.svg';
import PlusGIcon from '../../assets/plus-green.svg';


const AddQuestions = () => {
  const [assignment, setAssignment] = useState({});
  const [moduleId, setModuleId] = useState('')
  const [startDate, setStartDate] = useState('');
  const [questions, setQuestions] = useState([]);
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [objectives, setObjectives] = useState([]);
  const { assignmentId } = useParams();
  const navigate = useNavigate();

  const navigateToCreateQuestion = () => {
    navigate(`/lti/create_question/${assignmentId}`)
  }

  const navigateToSelectQuestions = () => {
    navigate(`/lti/select_questions/${moduleId}/${assignmentId}/`)
  }

  const navigateToCreateLLMQuestion = () => {
    navigate(`/lti/create_question/${assignmentId}?llm=true`)
  }

  const getAssignment = async () => {
    try {
      const response = await fetch(`/lti/api/assignments/get_assignment_by_id/${assignmentId}`);
      const data = await response.json();
      setAssignment(data);
      setModuleId(data.associated_module)
      for (let i = 0; i < data.questions.length; i++) {
        let question = data.questions[i];
        let possibleAnswers = question.possible_answers;

        for (let j = 0; j < possibleAnswers.length; j++) {
          let possibleAnswer = possibleAnswers[j];
          const possibleAnswerIsCorrectResponse = await fetch(`/lti/api/questions/possible_answer_is_correct/${possibleAnswer.id}`);
          const possibleAnswerIsCorrectData = await possibleAnswerIsCorrectResponse.json();
          possibleAnswers[j].is_correct = possibleAnswerIsCorrectData.is_correct;
        }
      }

      setQuestions(data.questions);
      setStartDate(formatDate(data.start_date));
      setEndDate(formatDate(data.end_date));

      const skillResponse = await fetch(`/lti/api/skills/get_skill_by_assignment_id/${assignmentId}`)


      const skillData = await skillResponse.json();

      setObjectives(skillData.length)

      console.log(skillResponse)
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
    dateString = dateString.replace(/Z$/, '');
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
    return (<LoadingPage />)
  }

  const handleDeleteFromAssignment = async (questionId) => {
    try {
      const formData = new FormData();
      formData.append('question_id', questionId);
      formData.append('assignment_id', assignmentId);

      const response = await fetch(`/lti/api/questions/delete_question_from_assignment/`, {
        method: 'POST',
        body: formData,
      });

      if (response.status === 204) {
        getAssignment()
      }

    } catch (error) {
      console.error('Error deleting question:', error);
    }
  }

  const handleDeleteQuestion = async (questionId) => {
    try {
      const formData = new FormData();
      formData.append('question_id', questionId);
      formData.append('assignment_id', assignmentId);

      const response = await fetch(`/lti/api/questions/delete_question/`, {
        method: 'POST',
        body: formData
      });

      if (response.status === 204) {
        getAssignment()
      }
    }
    catch (error) {
      console.error(error);
    }
  }

  const renderHeader = () => {
    if (assignment.questions.length > 0) {
      return <header>
        <section className='flex justify-between items-center'>
          <section className='flex flex-col gap-4'>
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
          </section>
        </section>

        <section className='mt-10 mb-2 flex justify-between items-center h-24 rounded-md border border-slate-300'>
          <section className='flex justify-evenly gap-4 pl-4'>
            <article className='text-center'>
              <h2 className='text-slate-500 text-lg font-medium'>Objectives</h2>
              <h3 className='text-slate-900 text-3xl font-medium'>{objectives}</h3>
            </article>
            <article className='text-center'>
              <h2 className='text-slate-500 text-lg font-medium'>Questions</h2>
              <h3 className='text-slate-900 text-3xl font-medium'>{assignment.questions.length}</h3>
            </article>
            <article className='text-center'>
              <h2 className='text-slate-500 text-lg font-medium'>Points</h2>
              <h3 className='text-slate-900 text-3xl font-medium'>{assignment.total_points}</h3>
            </article>
          </section>
          <section className='flex gap-2 pr-4'>
            <Button label='Add a question' icon={<PlusIcon />} onClick={() => navigateToCreateQuestion()} />
            <Button label='Add an LLM generated question' icon={<PlusIcon />} onClick={() => navigateToCreateLLMQuestion()}/>
            <Button label='Question Bank' type='outline' onClick={() => navigateToSelectQuestions()} />
          </section>
        </section>
      </header>
    }
    return (<><section className='flex flex-row gap-2'>
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
      </section></>)
  }


  return (
    <main className='p-6 pl-10 flex flex-col gap-4'>
      {renderHeader()}

      {assignment.questions.length > 0 ?
        <section className='flex flex-col gap-4 h-full bg-gray-100'><QuestionList questions={questions} handleDeleteQuestion={handleDeleteQuestion} assignmentId={assignmentId} handleDeleteFromAssignment={handleDeleteFromAssignment} /></section>
        : <section className="flex flex-col gap-4 justify-center items-center">
          <span className='flex flex-col justify-center items-center'>
            <Writing />
            <h2 className='text-slate-950 text-2xl font-semibold'>Add your first question</h2>
            <p className='text-slate-600 text-xl font-medium w-1/2 text-center'>Create a question or use an LLM to generate one for you. Any questions you create for this assignment will show up here</p>
          </span>
          <section className='flex gap-4'>
            <Button label='Add a question' icon={<PlusIcon />} onClick={() => navigateToCreateQuestion()} />
            <Button label='Add an LLM generated question' type='outline' icon={<PlusGIcon />} onClick={() => navigateToCreateLLMQuestion()} />
          </section>
          <Button label='Search Question Bank' type='gray' onClick={() => navigateToSelectQuestions()} />
        </section>}
    </main>
  );
}

export default AddQuestions;
