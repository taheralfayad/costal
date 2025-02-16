import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Checkbox, Dropdown, Input, Title } from '../../design-system';

const CreateAssignment = () => {
  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [assessmentType, setAssessmentType] = useState('');
  const { moduleId } = useParams();
  const navigate = useNavigate();

  const handleCreateAssignment = async () => {
    const formData = new FormData();
    formData.append('name', name);
    formData.append('start_date', startDate);
    formData.append('end_date', endDate);
    formData.append('assessment_type', assessmentType);
    formData.append('course_id', COURSE_ID);
    formData.append('module_id', moduleId);

    const response = await fetch('/lti/api/assignments/create_assignment/', {
      method: 'POST',
      body: formData,
    });

    if (response.status === 201) {
      console.log("ts")
      navigate('/lti/course_outline');
    }
  }

  const handleAssessmentTypeChange = (option) => {
    setAssessmentType(option);
  }

  const handleNameChange = (e) => {
    console.log(COURSE_ID);
    console.log(e.target.value);
    setName(e.target.value);
  }

  const handleStartDateChange = (e) => {
    console.log(e.target.value);
    setStartDate(e.target.value);
  }

  const handleEndDateChange = (e) => {
    console.log(e.target.value);
    setEndDate(e.target.value);
  }


  return (
    <div>
      <main className='p-6 pl-10 w-1/2 flex flex-col gap-4'>
        <Title>Create Assignment</Title>
        <Input label='Name' placeholder='Great Assignment' value={name} onChange={(e) => (handleNameChange(e))}/>
        <section className='flex justify-between'>
          <Input label='Start Date' placeholder='10/10/2024' type='datetime-local' onChange={(e) => (handleStartDateChange(e))}/>
        </section>
        <section className='flex justify-between'>
          <Input label='End Date' placeholder='10/12/2024' type='datetime-local' onChange={(e) => (handleEndDateChange(e))}/>
        </section>
        <section className='flex flex-col gap-4'>
          <Dropdown label="Assignment Type" placeholder="Assignment Type" options={[{"label": 'Homework'}, {"label": 'Quiz'}]} onSelect={handleAssessmentTypeChange}/>
        </section>

        <section className='h-20 rounded-[10px] border border-slate-300 flex items-center justify-center gap-4'>
          <label
            className='block text-sm font-medium text-gray-700 text-center'
          >Import questions and settings from another assignment</label>
          <Checkbox label='' />
        </section>
      </main>
      <section className='flex justify-end gap-2 pr-2'>
        <Button label='Create' onClick={handleCreateAssignment}/>
        <Button label='Cancel' type='outline' onClick={() => navigate('/lti/course_outline')}/>
      </section>
    </div>
  );
}

export default CreateAssignment;