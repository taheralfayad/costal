import React, { useState } from 'react';
import Button from '../../design-system/Button';
import Dropdown from '../../design-system/Dropdown';
import Input from '../../design-system/Input';
import RichTextEditor from '../../design-system/RichTextEditor';

const CreateQuestion = () => {
  const [editorValue, setEditorValue] = useState('');

  const handleInputChange = (value) => {
    setEditorValue(value);
  };

  return (
    <div>
      <main className='p-6 pl-10 w-1/2 flex flex-col gap-4'>
        <h1 className='text-slate-950 text-3xl font-semibold'>Create Question</h1>
        <Input label='Name' placeholder='Great Assignment' />
        <Dropdown label='Objective' />
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