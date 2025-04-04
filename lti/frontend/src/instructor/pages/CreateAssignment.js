import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { combineDateTime } from '../../constants/functions';
import { Button, Checkbox, DatePickerInput, Dropdown, Input, TimePickerInput, Title } from '../../design-system';

const CreateAssignment = () => {
  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState(() => {
    const today = new Date();
    return `${today.getMonth() + 1}/${today.getDate()}/${today.getFullYear()}`;
  });
  const [startTime, setStartTime] = useState('');
  const [endDate, setEndDate] = useState(() => {
    const today = new Date();
    return `${today.getMonth() + 1}/${today.getDate()}/${today.getFullYear()}`;
  });
  const [endTime, setEndTime] = useState('');
  const [assessmentType, setAssessmentType] = useState('');
  const { moduleId } = useParams();
  const navigate = useNavigate();

  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    let start = combineDateTime(startDate, startTime)
    let end = combineDateTime(endDate, endTime)

    const formData = new FormData();
    formData.append('name', name);

    formData.append('start_date', start);
    formData.append('end_date', end);
    formData.append('assessment_type', assessmentType);
    formData.append('course_id', COURSE_ID);
    formData.append('module_id', moduleId);
    console.log(formData)

    await fetch('/lti/api/assignments/create_assignment/', {
      method: 'POST',
      body: formData,
    }).then((res) => {
      if (res.status === 201) {
        console.log("ts")

        navigate('/lti/course_outline');
      }
    }).catch(err => {
      console.log(err.message);
    })


  }

  return (
    <div>
      <form onSubmit={handleCreateAssignment}>
        <main className='p-6 pl-10 w-1/2 flex flex-col gap-4'>
          <Title>Create Assignment</Title>

          <Input required label='Name' placeholder='Great Assignment' value={name} onChange={(e) => setName(e.target.value)} />
          <section className='flex justify-between gap-4'>
            <DatePickerInput required position='top-20 left-1' label='Start Date' placeholder='10/10/2024' type='datetime-local' value={startDate} onChange={(value) => setStartDate(value)} />
            <TimePickerInput required label='Start Time' placeholder='12pm EST' value={startTime} onChange={(value) => setStartTime(value)} />
          </section>
          <section className='flex justify-between gap-4'>
            <DatePickerInput required position='top-20 left-1' label='End Date' placeholder='10/12/2024' type='datetime-local' value={endDate} onChange={(value) => setEndDate(value)} />
            <TimePickerInput required label='End Time' placeholder='12pm EST' value={endTime} onChange={(value) => setEndTime(value)} />
          </section>
          <section className='flex flex-col gap-4'>
            <Dropdown required label="Assignment Type" placeholder="Assignment Type" options={[{
              "label": 'Homework', "onClick": () => {
                setAssessmentType('Homework')
              }
            }, {
              "label": 'Quiz', "onClick": () => {
                setAssessmentType('Quiz')
              }
            }]} />
          </section>
        </main>
        <section className='flex justify-end gap-2 pr-2'>
          <Button label='Create' form={true} />
          <Button label='Cancel' type='outline' onClick={() => navigate('/lti/course_outline')} />
        </section>
      </form>
    </div>
  );
}

export default CreateAssignment;