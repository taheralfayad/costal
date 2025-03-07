import React, { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import { Title } from '../../design-system';
import CourseInfo from '../../instructor/components/CourseInfo';
import AlertCircle from '../../assets/alert-circle.svg';
import CheckCircle from '../../assets/check-circle.svg';
import ArrowCircle from '../../assets/arrow-circle.svg';

const LandingPage = () => {
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState([]);
  
  function formatTimestamp(isoString) {
      const date = new Date(isoString);
      const options = { month: "long", day: "numeric" };
      const formattedDate = date.toLocaleDateString("en-US", options);
      
      const day = date.getDate();
      const suffix = (day % 10 === 1 && day !== 11) ? "st" :
                    (day % 10 === 2 && day !== 12) ? "nd" :
                    (day % 10 === 3 && day !== 13) ? "rd" : "th";

      return formattedDate.replace(/\d+/, day + suffix);
  }

  const navigateToAssignment = (id) => {
    navigate(`/lti/assignment_landing/${id}`);
   }

  useEffect(() => {
    const retrieveAssignments = async() => {
      const response = await fetch(`/lti/api/assignments/get_course_assignments?course_id=${COURSE_ID}`, {method: 'GET'})
      const data = await response.json()
      for (let i = 0; i < data.length; i++) {
        data[i].start_date = formatTimestamp(data[i].start_date)
        data[i].end_date = formatTimestamp(data[i].end_date)
      }
      setAssignments(data);
    }

    retrieveAssignments();
  }, [])

  return (
    <main>
      <header className='bg-emerald-400 p-8 flex flex-col gap-2 pl-10'>
        <Title white>Welcome to COSTAL</Title>
        <h2 className='text-white text-xl font-semibold'>{COURSE_NAME}</h2>
        <CourseInfo white />
      </header>
      <section>
        <h3 className='text-xl font-medium text-slate-900 ml-8 py-4'>Schedule</h3>
        <section className='bg-white rounded-xl border border-slate-300 mx-8'>
          <table className='w-full text-center'>
            {assignments.map((assignment, index) =>
            <tr className='border-b border-slate-300 text-slate-700 text-sm font-medium'>
              <td className='p-4 text-left'>{assignment.name}</td>
              <td className='underline decoration-dashed underline-offset-4'> {assignment.end_date} </td> 
              <td>
                <button onClick={() => navigateToAssignment(assignment.id)}>
                  <ArrowCircle  />
                </button>
              </td>
            </tr> 
            )}
            <tr className='border-b border-slate-300 text-slate-700 text-sm font-medium'>
              <td className='p-4 text-left w-4/5'>Topic</td>
              <td className='align-middle text-center'><article className='flex items-center justify-center gap-2 mr-8'>
                <AlertCircle />
                <p className='underline decoration-dashed decoration-red-500 text-red-500 underline-offset-4 text-sm'>Feb 29</p>
              </article></td>
              <td><CheckCircle /></td>
            </tr>
            <tr className='border-b border-slate-300 text-slate-700 text-sm font-medium'>
              <td className='p-4 text-left'>Topic</td>
              <td className='underline decoration-dashed underline-offset-4'>Feb 29</td>
              <td><ArrowCircle  /></td>
            </tr>

            <tr className='text-slate-700 text-sm font-medium'>
              <td className='p-4 text-left'>Topic</td>
              <td className='underline decoration-dashed underline-offset-4'>Feb 29</td>
              <td><ArrowCircle /></td>
            </tr>
          </table>
        </section>
      </section>
    </main>
  );
};

export default LandingPage;
