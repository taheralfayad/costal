import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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

  const combineDateTime = (dateStr, timeStr) => {
    let [month, day, year] = dateStr.split('/').map(Number);
    
    let [time, period] = timeStr.split(' ');
    let [hours, minutes] = time.split(':').map(Number);
    
    if (period === 'PM' && hours !== 12) {
        hours += 12;
    } else if (period === 'AM' && hours === 12) {
        hours = 0;
    }
    
    let formattedDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    
    return formattedDate;
}

  const handleCreateAssignment = async () => {
    console.log(startDate)
    console.log(startTime)

    let start = combineDateTime(startDate, startTime)
    let end = combineDateTime(endDate, endTime)

    console.log(start)
    console.log(end)
    const formData = new FormData();
    formData.append('name', name);

    formData.append('start_date', start);
    formData.append('end_date', end);
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

  const handleQuizSelection = () => {
    setAssessmentType('Quiz');
  }

  const handleHomeworkSelection = () => {
    setAssessmentType('Homework');
  }

  const handleNameChange = (e) => {
    console.log(COURSE_ID);
    console.log(e.target.value);
    setName(e.target.value);
  }

  const handleStartDateChange = (value) => {
    setStartDate(value);
  }

  const handleEndDateChange = (value) => {
    setEndDate(value);
  }

  const handleStartTimeChange = (value) => {
    setStartTime(value);
  }
  
  const handleEndTimeChange = (value) => {
    setEndTime(value);
  }


  return (
    <div>
      <main className='p-6 pl-10 w-1/2 flex flex-col gap-4'>
        <Title>Create Assignment</Title>
        <Input label='Name' placeholder='Great Assignment' value={name} onChange={(e) => (handleNameChange(e))}/>
        <section className='flex justify-between gap-4'>
          <DatePickerInput position='top-20 left-1' label='Start Date' placeholder='10/10/2024' type='datetime-local' value={startDate} onChange={(e) => (handleStartDateChange(e))}/>
          <TimePickerInput label='Start Time' placeholder='12pm EST'value={startTime} onChange={(e) => (handleStartTimeChange(e))} />
        </section>
        <section className='flex justify-between gap-4'>
          <DatePickerInput position='top-20 left-1' label='End Date' placeholder='10/12/2024' type='datetime-local' value={endDate} onChange={(e) => (handleEndDateChange(e))}/>
          <TimePickerInput label='End Time' placeholder='12pm EST' value={endTime} onChange={(e) => (handleEndTimeChange(e))} />
        </section>
        <section className='flex flex-col gap-4'>
          <Dropdown label="Assignment Type" placeholder="Assignment Type" options={[{"label": 'Homework', "onClick": handleHomeworkSelection}, {"label": 'Quiz', "onClick": handleQuizSelection}]}/>
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