import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from "react-router-dom"
import { Button, Checkbox, Dropdown, Input, RichTextEditor, Title } from '../../design-system';
import MultipleChoiceConfig from '../components/MultipleChoiceConfig';
import ShortAnswerConfig from '../components/ShortAnswerConfig';
import { ToastContainer, toast, Bounce } from 'react-toastify';

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

export default CreateQuestion;
