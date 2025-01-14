import React, { useState, useEffect } from 'react';
import { Button, Dropdown, Input, RichTextEditor, Title } from '../../design-system';

const CreateQuestion = ({assignment}) => {
  const [questionName, setQuestionName] = useState('');
  const [editorValue, setEditorValue] = useState('');
  const [difficulty, setDifficulty] = useState('Easy');
  const [objectives, setObjectives] = useState([]);
  const [objective, setObjective] = useState('');

  const difficulties = ["Easy", "Medium", "Hard"];

  const fetchObjectives = async () => {
    try {
      const response = await fetch(`/lti/api/skills/get-skill-by-assignment-id/${assignment.id}`);
      const data = await response.json();
      console.log(data)
      setObjectives(data);
    } catch (error) {
      console.error(error);
    }
  }

  const handleNameChange = (e) => {
    setQuestionName(e.target.value);
  }

  const handleObjectiveChange = (value) => {
    setObjective(value);
  }

  const handleDifficultyChange = (value) => {
    setDifficulty(value);
  }

  const handleInputChange = (value) => {
    setEditorValue(value);
  };

  useEffect(() => {
    fetchObjectives();
  }
  , []);

  return (
    <div>
      <main className='p-6 pl-10 w-1/2 flex flex-col gap-4'>
        <Title>Create Question</Title>
        <Input label='Name' placeholder='Great Assignment' value={questionName} onChange={(e) => (handleNameChange(e))}/>
        <Dropdown label='Objective' placeholder='Select Objective' value={objective} options={objectives.map(item => item.skill_name)} onSelect={handleObjectiveChange}/>
        <Dropdown label='Difficulty' placeholder='Select Difficulty' value={difficulty} options={difficulties} onSelect={handleDifficultyChange}/>
        <RichTextEditor value={editorValue} onChange={handleInputChange} />
        <Input type='number' label='Points' min={1} max={15} placeholder={1} width='w-1/4' />
      </main>
      <section className='flex justify-end gap-2 pr-4 pb-2'>
        <Button label='Create' />
        <Button label='Cancel' type='outline' />
      </section>
    </div>
  );
}

export default CreateQuestion;