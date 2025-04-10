import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, useLocation} from "react-router-dom"
import { Button, Checkbox, Dropdown, Input, RichTextEditor, Title, Notification } from '../../design-system';
import MultipleChoiceConfig from '../components/MultipleChoiceConfig';
import ShortAnswerConfig from '../components/ShortAnswerConfig';
import { ToastContainer, toast, Bounce } from 'react-toastify';
import LoadingPage from '../components/LoadingPage';


// for use in gen question using llm

// Objectives:
/* 
  1. Implement a way for this component to know if it's being called with LLM gen or without.
  2. If it's being called with LLM gen, we need to call the LLM API to generate a question.
    2a. We need to pass the generated question to the RichTextEditor and the possible answers to the MultipleChoiceConfig.
  3. If it's being called without LLM gen, we need to render the component as usual.
*/


const CreateQuestion = () => {
  const navigate = useNavigate()
  const [questionName, setQuestionName] = useState('');
  const [editorValue, setEditorValue] = useState('');
  const [solvingText, setSolvingText] = useState('');
  const [difficulty, setDifficulty] = useState('Easy');
  const [objectives, setObjectives] = useState([]);
  const [dropdownObjectives, setDropdownObjectives] = useState([]);
  const [objective, setObjective] = useState('');
  const [selectedCheckbox, setSelectedCheckbox] = useState(null);
  const [points, setPoints] = useState(1);
  const [multipleChoiceAnswers, setMultipleChoiceAnswers] = useState([{ id: 1, text: '', checked: false }]);
  const [shortAnswerItems, setShortAnswerItems] = useState([]);
  const isLLMGen = new URLSearchParams(location.search).get('llm') === 'true';
  const [isLoading, setIsLoading] = useState(true);
  const [previousQuestions, setPreviousQuestions] = useState([]);
  const [data, setData] = useState(null);
  const [courseName, setCourseName] = useState('');
  const [editorKey, setEditorKey] = useState(0); // Force re-render key
  const [objectiveSelected, setObjectiveSelected] = useState(false);
  const [isConfirmingObjective, setIsConfirmingObjective] = useState(true);


  const editorRef = useRef(null)

  const { assignmentId } = useParams()

  const onSelectDifficulty = (value) => {
    setDifficulty(value)
  }

  const difficulties = [
    { "label": "Easy", "onClick": () => onSelectDifficulty("Easy") },
    { "label": "Medium", "onClick": () => onSelectDifficulty("Medium") },
    { "label": "Hard", "onClick": () => onSelectDifficulty("Hard") }
  ]

  const onSelectObjective = (value) => {
    setObjective(value)
  }

  const formatObjectivesForDropdown = () => {
    let formattedObjectivesForDropdown = []

    for (let i = 0; i < objectives.length; i++) {
      let temp = {
        "label": objectives[i].name,
        "onClick": () => onSelectObjective(objectives[i].name)
      }
      formattedObjectivesForDropdown.push(temp)
    }

    setDropdownObjectives(formattedObjectivesForDropdown)
  }

  const fetchObjectives = async () => {
    try {
      const response = await fetch(`/lti/api/skills/get_skill_by_assignment_id/${assignmentId}`);
      const data = await response.json();
      setObjectives(data);
    } catch (error) {
      console.error(error);
    }
  };

  


  useEffect(() => {
    const fetchData = async () => {
      if (!isLLMGen || !objectiveSelected) return;
      try {
        const prevResponse = await fetch(`/lti/api/assignments/get_assignment_by_id/${assignmentId}`);
        const prevData = await prevResponse.json();
        const courseResponse = await fetch(`/lti/api/modules/get_modules_by_course_id/${COURSE_ID}`);
        const courseData = await courseResponse.json();
        setCourseName(courseData[0].name);
  
        const llmResponse = await fetch(`/lti/api/questions/generate_question/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            course_name: courseData[0].name,
            text: objective,
            num_questions: 1,
            previous_questions: prevData['questions'],
          }),
        });
  
        const llmData = await llmResponse.json();
        if (llmData.question) {
          setEditorValue(llmData.question);
          setEditorKey(prevKey => prevKey + 1);
        }
        else{
          toast.error("We ran into a problem generating your question, please try again in a moment.")
        }
  
        if (llmData.options) {
          const formattedOptions = Object.entries(llmData.options).map(([key, value]) => ({
            id: key,
            text: value,
            checked: key === llmData.answer,
          }));
          setMultipleChoiceAnswers(formattedOptions);
          handleCheckboxChange('multiple');
        }
  
        setDifficulty('Easy');
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };
  
    fetchData();
  }, [isLLMGen, objectiveSelected, assignmentId]);
  

  useEffect(() => {
  }, [editorValue]);
  
  

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!editorValue) {
      toast.error("Please add text to your question")
      return;
    }

    if (!selectedCheckbox) {
      toast.error("Please select a question type (Short Answer or Multiple Choice)")
      return;
    }

    if (selectedCheckbox === 'multiple' && multipleChoiceAnswers.length < 3) {
      toast.error("Please add more choices to multiple choice");
      return;
    }

    if (selectedCheckbox === 'short' && shortAnswerItems.length < 1) {
      toast.error("Please add more accepted answers");
      return;
    }

    const skillID = objectives.find(item => item.name === objective).id;
    const formData = new FormData();

    formData.append('assignment_id', assignmentId);
    formData.append('name', questionName);
    formData.append('skill_id', skillID);
    formData.append('difficulty', difficulty);
    formData.append('points', points);
    formData.append('text', editorValue);
    formData.append('type', selectedCheckbox);
    formData.append('explanation', solvingText);


    if (selectedCheckbox === 'multiple') {
      const multipleChoiceData = multipleChoiceAnswers.filter((choice) => choice.text.trim() !== "").map((choice) => {
        return { possible_answer: choice.text, is_correct: choice.checked };
      }
      );
      formData.append('possible_answers', JSON.stringify(multipleChoiceData));
    }
    else {
      const shortAnswerData = shortAnswerItems.map((item) => {
        return { possible_answer: item, is_correct: true };
      });
      formData.append('possible_answers', JSON.stringify(shortAnswerData));
    }

    try {
      const response = await fetch('/lti/api/questions/create_question/', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        navigate(`/lti/add_questions/${assignmentId}`)
      }

    } catch (error) {
      console.error(error);
    }
  };

  const handleNameChange = (e) => {
    setQuestionName(e.target.value);
  };

  const handlePointsChange = (e) => {
    setPoints(e.target.value);
  };

  const handleObjectiveChange = (value) => {
    setObjective(value);
  };

  const handleDifficultyChange = (value) => {
    setDifficulty(value);
  };

  const handleCheckboxChange = (checkboxId) => {
    setSelectedCheckbox((prev) => (prev === checkboxId ? null : checkboxId));
  };

  const handleInputChange = (value) => {
    setEditorValue(value);
  };

  useEffect(() => {
    fetchObjectives();
  }, []);

  useEffect(() => {
    formatObjectivesForDropdown();
  }, [objectives]);

  if (isLLMGen && isConfirmingObjective) {
    return (
      <div className="p-10 flex flex-col gap-6 items-center">
      <Title>Select Objective for LLM Question</Title>
      <Notification type={'error'} message={`Warning: The LLM may behave unexpectedly if there are fewer than 5 human-made questions. Always double-check the question.`}/>
      <Dropdown
        label="Objective"
        placeholder="Select Objective"
        value={objective}
        options={dropdownObjectives}
      />
      <Button
        label="Generate Question with this Objective"
        onClick={() => {
        if (!objective) {
          toast.error("Please select an objective first");
          return;
        }
        setObjectiveSelected(true);
        setIsConfirmingObjective(false);
        setIsLoading(true);
        }}
      />
      <Button
        type="outline"
        label="Cancel"
        onClick={() => navigate(`/lti/add_questions/${assignmentId}`)}
      />
      </div>
    );
  }
  else if (isLoading && isLLMGen) {
    return <div className='text-center mt-[20%]'>Sit tight as we generate your question!<LoadingPage></LoadingPage></div>
  }
  else {
    return (
      <div>
        <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop={false} closeOnClick={false} rtl={false} pauseOnFocusLoss draggable pauseOnHover theme="colored" transition={Bounce}
      />
      <form onSubmit={handleSubmit}>
        <main className='flex'>
          <section className='p-6 pl-10 w-1/2 flex flex-col gap-4'>
            <Title>Create Question</Title>
            <Input required label='Name' placeholder='Great Question' value={questionName} onChange={(e) => handleNameChange(e)} />
            <Dropdown required label='Objective' placeholder='Select Objective' value={objective} options={dropdownObjectives} />
            <Dropdown required label='Difficulty' placeholder='Select Difficulty' value={difficulty} options={difficulties} onSelect={handleDifficultyChange} />
            <RichTextEditor placeholder='Question' required value={editorValue} onChange={handleInputChange} />
            <section className='flex flex-col gap-4'>
              <label className='block text-sm font-medium text-gray-700'>
                Choose your question type
              </label>
              <Checkbox
                label="Short Answer"
                checked={selectedCheckbox === 'short'}
                onChange={() => handleCheckboxChange('short')}
                id="short"
              />
              <Checkbox
                label="Multiple Choice"
                checked={selectedCheckbox === 'multiple'}
                onChange={() => handleCheckboxChange('multiple')}
                id="multiple"
              />
            </section>
            <Input type='number' label='Points' min={1} max={15} placeholder={1} width='w-1/4' onChange={(e) => handlePointsChange(e)} />
          </section>
          {selectedCheckbox &&
            <aside className='mt-16 ml-10 w-2/5 h-1/2 flex flex-col gap-4 border border-slate-300 rounded-lg shadow-sm mx-6'>
              {selectedCheckbox === 'short' ?
                <ShortAnswerConfig items={shortAnswerItems} setItems={setShortAnswerItems} /> :
                <MultipleChoiceConfig choices={multipleChoiceAnswers} setChoices={setMultipleChoiceAnswers} />}
              <section className='mx-4 mb-2'>
                <RichTextEditor label='Add an explanation on how to solve this question' required value={solvingText} onChange={setSolvingText} />
              </section>
            </aside>}
        </main>
        <section className='flex justify-end gap-2 pr-4 pb-2'>
          <Button label='Create' form={true} />
          <Button label='Cancel' type='outline' onClick={() => navigate(`/lti/add_questions/${assignmentId}`)} />
        </section>
      </form>
    </div>
    );
  };
};

export default CreateQuestion;
