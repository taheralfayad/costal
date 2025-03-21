import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import Arrow from '../../assets/arrow-left.svg';
import Menu from '../../assets/menu-alt.svg';
import { Title } from '../../design-system';
import Answered from '../components/Answered';
import Loader from '../components/Loader';
import ProgressBar from '../components/ProgressBar';
import SideMenu from '../components/SideMenu';
import SingleChoice from '../components/SingleChoice';
import Textbook from '../components/Textbook';
import Video from '../components/Video';
import Writing from '../components/Writing';

const Assignment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setMenuOpen] = useState(false)
  const [seconds, setSeconds] = useState(null)
  const [question, setQuestion] = useState(location.state.question)
  const [assignmentAttempt, setAssignmentAttempt] = useState(location.state.assignmentAttempt)
  const [assignment, setAssignment] = useState(location.state.assignment)
  const [answerChoices, setAnswerChoices] = useState([])
  const [answerChoice, setAnswerChoice] = useState(null);

  const onSelect = (label) => {
    setAnswerChoice(label);
  }

  const onSubmit = async (textAnswer = null) => { // textAnswer is only used for writing questions
    const formData = new FormData();
    

    if (textAnswer && question.type === 'short') {
      formData.append('answer_text', textAnswer)
    }
    else {
      for (let i = 0; i < question.possible_answers.length; i++) {
        if (question.possible_answers[i].answer == answerChoice) {
          formData.append("answer_choice", question.possible_answers[i].id)
        }
      }
    }

    formData.append('assignment_id', assignment.id)
    formData.append('user_id', USER_ID)
    formData.append('question_id', question.id)
    formData.append('number_of_seconds_to_answer', seconds)
    formData.append('assignment_attempt_id', assignmentAttempt.id)

    if (assignment.assessment_type === 'quiz' || assignment.assessment_type === 'prequiz') {
        const response = await fetch('/lti/api/questions/answer_quiz_question/', {
          method: 'POST',
          body: formData
        })

        const data = await response.json()

        if (response.ok) {
          if (data.assessment_status === 'completed') {
            navigate('/lti/student_landing/')
          }

          setQuestion(data)
          setAnswerChoice(null)
          setSeconds(0)
        }
    }
    else {
       const response = await fetch('/lti/api/questions/answer_question/', {
          method: 'POST',
          body: formData
        })

        const data = await response.json()

        if (response.ok) {
          if (data.assessment_status === 'completed') {
            navigate('/lti/student_landing/')
          }

          setQuestion(data)
          setAnswerChoice(null)
          setSeconds
       } 
    }
  }


useEffect(() => {
    const possibleAnswers = question.possible_answers;
    let choices = possibleAnswers.map(ans => ({
        label: ans.answer,
        onChange: () => onSelect(ans.answer),  
        checked: false
    }));

    setAnswerChoices(choices);
}, [question]);

useEffect(() => {
    setAnswerChoices(prevChoices =>
        prevChoices.map(choice => ({
            ...choice,
            checked: choice.label === answerChoice 
        }))
    );
}, [answerChoice]);


  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000); // Increment every second

    return () => clearInterval(interval); // Cleanup when component unmounts
  }, []); 


  return (
    <main>
      <SideMenu isMenuOpen={isMenuOpen} />
      <section
        className={`flex-1 transition-all duration-300 ${isMenuOpen ? "ml-64" : "ml-0"
          }`}
      >
        <header className='p-6 pl-10 flex flex-col gap-4'>
          <section className='flex gap-2 ml-8'>
            <button onClick={() => navigate(-1)}>
              <Arrow className='w-5 h-5' />
            </button> 
            <p>Back to Assignment Overview</p>
          </section>
          <section className='flex gap-2 items-center'>
            <span onClick={() => setMenuOpen(!isMenuOpen)}><Menu /></span>
            <Title>{question.associated_skill.name}</Title>
          </section>
          <ProgressBar percentage={20} />
        </header>

        <section className='bg-[#f8f8f8] h-full py-8'>
          {question.type === "multiple" ? <SingleChoice title={question.name} question={question.text} options={answerChoices} onSubmit={onSubmit}/> :<Writing title={question.name} question={question.text} onSubmit={onSubmit} placeholder='Enter your answer here' />}
        </section>
      </section>
    </main>

  );
};

export default Assignment;
