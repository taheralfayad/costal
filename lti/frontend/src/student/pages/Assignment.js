import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import Arrow from '../../assets/arrow-left.svg';
import Menu from '../../assets/menu-alt.svg';
import { Title } from '../../design-system';
import Answered from '../components/Answered';
import Loader from '../components/Loader';
import MultipleChoice from '../components/MultipleChoice';
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
  const [question, setQuestion] = useState(location.state)
  const [answerChoices, setAnswerChoices] = useState([])
  const [answerChoice, setAnswerChoice] = useState(null);

  const onSelect = (label) => {
    setAnswerChoice(label);
  }

  const onSubmit = async () => {
    const formData = new FormData();
    
    formData.append('assignment_id', question.assignments[0]); // TODO: Once the app starts supporting questions being in multiple assignments, this line needs to change
    formData.append('user_id', USER_ID);
    formData.append('question_id', question.id);
    formData.append('number_of_seconds_to_answer', seconds);
  
    const request = await fetch(`/lti/api/questions/answer_question`, {method: 'POST', body: formData})
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
          {question.type === "multiple" ? <MultipleChoice title={question.name} question={question.text} options={answerChoices}/> :<Writing title={question.name} question={question.text} placeholder='Enter your answer here' />}
        </section>
      </section>
    </main>

  );
};

export default Assignment;
