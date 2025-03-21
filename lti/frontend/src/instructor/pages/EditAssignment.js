import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, DatePickerInput, Dropdown, Input, TimePickerInput, Title } from '../../design-system';
import StatsCard from '../components/StatsCard';
import Pencil from '../../assets/pencil-line.svg';
import { combineDateTime, revertDateTime } from '../../constants/functions';


const EditAssignment = () => {
  const { assignmentId } = useParams();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('');
  const [assessmentType, setAssessmentType] = useState('');

  const getAssignment = async () => {
    console.log(assignmentId)
    const response = await fetch(`/lti/api/assignments/get_assignment_by_id/${assignmentId}`);
    const resData = await response.json();
    console.log(resData)
    setName(resData.name);
    setStartDate(revertDateTime(resData.start_date).date)
    setStartTime(revertDateTime(resData.start_date).time)
    setEndDate(revertDateTime(resData.end_date).date)
    setEndTime(revertDateTime(resData.end_date).time)
    setAssessmentType(resData.assessment_type)
  };

  useEffect(() => {
    getAssignment();
  
  }, []);


  const handleForm = async () => {
    let start = combineDateTime(startDate, startTime)
    let end = combineDateTime(endDate, endTime)

    const formData = new FormData();
    formData.append('name', name);
    formData.append('start_date', start);
    formData.append('end_date', end);
    formData.append('assessment_type', assessmentType);

    await fetch(`/lti/api/assignments/edit_assignment/${assignmentId}/`, {
      method: 'POST',
      body: formData,
    }).then((res) => {
      if (res.status === 200) {
        console.log("ts")

        navigate('/lti/course_outline');
      }
    }).catch(err => {
      console.log(err.message);
    })
  }

  return (
    <main className='p-4 pl-10 flex flex-col gap-4'>
      <Title>Edit an Assignment</Title>
      <section className='flex gap-[6rem]'>
        <section className='flex flex-col gap-4'>
          <Input label='Name' placeholder='Great Assignment' value={name} onChange={(e) => setName(e.target.value)} />
          <section className='flex justify-between gap-4'>
            <DatePickerInput label='Start Date' placeholder={startDate} value={startDate} onChange={(value) => setStartDate(value)} />
            <TimePickerInput label='Start Time' placeholder={startTime} value={startTime} onChange={(value) => setStartTime(value)} />
          </section>
          <section className='flex justify-between gap-4'>
            <DatePickerInput label='End Date' placeholder={endDate} value={endDate} onChange={(value) => setEndDate(value)} />
            <TimePickerInput label='End Time' placeholder={endTime} value={endTime} onChange={(value) => setEndTime(value)} />
          </section>
          <section className='flex flex-col gap-4'>
            <Dropdown label="Assignment Type" placeholder={assessmentType} options={[{
              "label": 'Homework', "onClick": () => {
                setAssessmentType('Homework')
              }
            }, {
              "label": 'Quiz', "onClick": () => {
                setAssessmentType('Quiz')
              }
            }]} />
          </section>
        </section>

      </section>

      <section className='flex justify-between items-center mt-6'>
        <StatsCard objectives={4} questions={4} points={4} />
        <section className='flex justify-end gap-2 pr-4'>
          <Button label='Save' onClick={handleForm} />
          <Button label='Cancel' type='outline' onClick={() => navigate('/lti/course_outline')} />
        </section>
      </section>
    </main>
  );
}

export default EditAssignment;