import React, { useState } from 'react';
import { Button, Checkbox, Dropdown, Input, RichTextEditor, Title } from '../../design-system';
import MultipleChoiceConfig from '../components/MultipleChoiceConfig';
import ShortAnswerConfig from '../components/ShortAnswerConfig';

const CreateQuestion = () => {
  const [editorValue, setEditorValue] = useState('');
  const [selectedCheckbox, setSelectedCheckbox] = useState(null);

  const handleCheckboxChange = (checkboxId) => {
    setSelectedCheckbox((prev) => (prev === checkboxId ? null : checkboxId));
  };

  const handleInputChange = (value) => {
    setEditorValue(value);
  };

  return (
    <div>
      <main className='flex'>
        <section className='p-6 pl-10 w-1/2 flex flex-col gap-4'>
          <Title>Create Question</Title>
          <Input label='Name' placeholder='Great Assignment' />
          <Dropdown label='Objective' />
          <RichTextEditor value={editorValue} onChange={handleInputChange} />
          <section className='flex flex-col gap-4'>
            <label
              className='block text-sm font-medium text-gray-700'
            >
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
          <Input type='number' label='Points' min={1} max={15} placeholder={1} width='w-1/4' />
        </section>
        {selectedCheckbox &&
        <aside className='mt-16 ml-10 w-2/5 h-1/2 flex flex-col gap-4 border border-slate-300 rounded-lg shadow-sm m-6'> 

          {selectedCheckbox === 'short' ? <ShortAnswerConfig /> : <MultipleChoiceConfig /> }

        </aside>}
      </main>
      <section className='flex justify-end gap-2 pr-4 pb-2'>
        <Button label='Create' />
        <Button label='Cancel' type='outline' />
      </section>
    </div>
  );
}

export default CreateQuestion;