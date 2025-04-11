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
import PopupModal from '../components/PopupModal';
import HwDone from './HwDone';
import { ToastContainer, toast, Bounce } from 'react-toastify';

const Assignment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setMenuOpen] = useState(false)
  const [seconds, setSeconds] = useState(null)
  const [question, setQuestion] = useState(location.state.question)
  const [assignmentAttempt, setAssignmentAttempt] = useState(location.state.assignmentAttempt)
  const [assignment, setAssignment] = useState(location.state.assignment)
  const [assignmentCompletionPercentage, setAssignmentCompletionPercentage] = useState(location.state.assignmentAttempt.completion_percentage)
  const [answerChoices, setAnswerChoices] = useState([])
  const [answerChoice, setAnswerChoice] = useState(null);
  const [showHintModal, setShowHintModal] = useState(false);
  const [hintText, setHintText] = useState('');
  const [isHintLoading, setIsHintLoading] = useState(false);
  const [hintAlreadyRequested, setHintAlreadyRequested] = useState(false);
  const [homeworkDone, setHomeworkDone] = useState(false);
  const [hideExplanation, setHideExplanation] = useState(true);
  const [correctAnswer, setCorrectAnswer] = useState("");
  const [studentAnswer, setStudentAnswer] = useState("");
  const [moveOnToNextQuestionFromExplanation, setMoveOnToNextQuestionFromExplanation] = useState(false);
  const [moveOnToAssignmentDoneFromExplanation, setMoveOnToAssignmentDoneFromExplanation] = useState(false);
  const [nextQuestionData, setNextQuestionData] = useState(null);

  const [answerIsCorrect, setAnswerIsCorrect] = useState('-1');

  const assignments = location.state.assignments;

  const onSelect = (label) => {
    setAnswerChoice(label);
  }

  const fetchHint = async () => {
    if (assignment.assessment_type === 'Quiz' || assignment.assessment_type === 'prequiz') {
      toast.error("Hints are not available for quizzes or prequizzes.", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      return;
    }
    if(hintAlreadyRequested) {
      setShowHintModal(true);
      return;
    }

    setShowHintModal(true);
    setIsHintLoading(true);


    try {
      const response = await fetch('/lti/api/questions/generate_hint/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ question_text: question.text, question_answer_choices: question.possible_answers })
      });
  
      const data = await response.json();
      setHintText(data.hint || "No hint found.");
    } catch (error) {
      console.error("Hint fetch error:", error);
      setHintText("An error occurred while generating the hint.");
    } finally {
      setIsHintLoading(false);
      setHintAlreadyRequested(true);
    }
  };

  const onSubmit = async (textAnswer = null, setValue = null) => { // textAnswer is only used for writing questions
    const formData = new FormData();
    setHintAlreadyRequested(false);
    setHintText('');
   
    if (textAnswer && question.type === 'short') {
      formData.append('answer_text', textAnswer)
      setValue('')
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

    if (assignment.assessment_type === 'Quiz' || assignment.assessment_type === 'prequiz') {
        const response = await fetch('/lti/api/questions/answer_quiz_question/', {
          method: 'POST',
          body: formData
        })

        const data = await response.json()

        const question = data.question
        const assignment_completion_percentage = data.assignment_completion_percentage

        if (response.ok) {
          if (data.assessment_status === 'completed') {
            setHomeworkDone(true)
            setTimeout(() => {
              navigate('/lti/student_landing/')
            }, 2500)
          }
          else {
            setQuestion(question)
            setAssignmentCompletionPercentage(assignment_completion_percentage)         
            setAnswerChoice(null)
            setSeconds(0)
          }
        }
    }
    else {
       const response = await fetch('/lti/api/questions/answer_question/', {
          method: 'POST',
          body: formData
        })

        const data = await response.json()

        let question = null
        let assignment_completion_percentage = null


        if (data.question) {
          question = data.question
          assignment_completion_percentage = data.assignment_completion_percentage
        }

        if (response.ok) {
          if (data.assessment_status === 'completed') {
            if (data.explanation !== "") {
              setHideExplanation(false)
              setMoveOnToAssignmentDoneFromExplanation(true)
            }
            else {
              setAnswerIsCorrect(data.is_correct) 
              setHomeworkDone(true)
              setTimeout(() => {
                navigate('/lti/student_landing/')
              }, 2500)
            }
            
          }
        else {
          setAnswerIsCorrect(data.is_correct)

          if(data.explanation !== "") {
            setHideExplanation(false)
            setCorrectAnswer(data.correct_answer)
            setStudentAnswer(data.answer_choice)
            setNextQuestionData({
              question: data.question,
              assignment_completion_percentage: data.assignment_completion_percentage,
            })
          }
          else{
            setTimeout(() => {
              setQuestion(question)
              setAssignmentCompletionPercentage(assignment_completion_percentage)
              setAnswerChoice(null)
              setAnswerIsCorrect('-1')
              setSeconds(0)
            }, 1500)
          }

        }
       } 
    }
  }


useEffect(() => {
  if (moveOnToNextQuestionFromExplanation && nextQuestionData) {


    setQuestion(nextQuestionData.question);
    setAssignmentCompletionPercentage(nextQuestionData.assignment_completion_percentage);
    setAnswerChoice(null);
    setAnswerIsCorrect('-1');
    setSeconds(0);
    setMoveOnToNextQuestionFromExplanation(false);
    setNextQuestionData(null);
    setHideExplanation(true);
  }
  else if (moveOnToNextQuestionFromExplanation && moveOnToAssignmentDoneFromExplanation) {
    setHomeworkDone(true);
    setTimeout(() => {
      navigate('/lti/student_landing/')
    }
    , 2500)
  }

}, [moveOnToNextQuestionFromExplanation, nextQuestionData, moveOnToAssignmentDoneFromExplanation])


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


  if(homeworkDone) {
    return <HwDone />
  }


  return (
    <main>
      <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop={false} closeOnClick={false} rtl={false} pauseOnFocusLoss draggable pauseOnHover theme="colored" transition={Bounce}/>
      <SideMenu isMenuOpen={isMenuOpen} assignments={assignments}/>
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
            <span className='cursor-pointer'  onClick={() => setMenuOpen(!isMenuOpen)}><Menu /></span>
            <Title>{question.associated_skill.name}</Title>
          </section>
          <ProgressBar percentage={assignmentCompletionPercentage} />
        </header>

        <section className='bg-[#f8f8f8] h-full py-8'>
        {hideExplanation ? (question.type === "multiple" 
        ? 
            <SingleChoice title={question.name} question={question.text} options={answerChoices} onSubmit={onSubmit} isCorrect={answerIsCorrect} onHintRequest={fetchHint} />
        : 
            <Writing title={question.name} question={question.text} onSubmit={onSubmit} placeholder='Enter your answer here' onHintRequest={fetchHint} isCorrect={answerIsCorrect}/>) :

           ( <Answered title={question.name} question={question.text} correctAnswer={correctAnswer} studentAnswer={studentAnswer} isCorrect={answerIsCorrect} explanation={question.explanation} setMoveOnToNextQuestionFromExplanation={setMoveOnToNextQuestionFromExplanation}/> )
        }
        </section>
      </section>
      {/* only show if assignment is not a quiz */}
      {showHintModal && (
      <PopupModal 
        isLoading={isHintLoading}
        input={hintText}
        setModalShow={setShowHintModal}
      />
      )}
    </main>
  );
};

export default Assignment;
