import React, { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import { Title } from '../../design-system';
import CourseInfo from '../../instructor/components/CourseInfo';
import AlertCircle from '../../assets/alert-circle.svg';
import CheckCircle from '../../assets/check-circle.svg';
import ArrowCircle from '../../assets/arrow-circle.svg';
import { FcCancel } from "react-icons/fc";
import Lock from '../../assets/lock.svg';
import LoadingPage from '../../instructor/components/LoadingPage.js';

const LandingPage = () => {
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [courseData, setCourseData] = useState({});

  const getIcon = (assignment) => {
    const ICON_SIZE = 38;
    if (assignment.is_locked && courseData.late_completion === false) return <FcCancel size={ICON_SIZE}/>;
    if (assignment.is_locked && assignment.locked_after_deadline) return <FcCancel size={ICON_SIZE}/>;
    if (assignment.is_locked) return <Lock size={5}/>;
    if (assignment.assignment_attempt) {
      return assignment.assignment_attempt.status === 2 ? <CheckCircle size={ICON_SIZE}/> : <ArrowCircle size={ICON_SIZE}/>;
    }
    return <ArrowCircle />;
  };

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
    navigate(`/lti/assignment_landing/${id}`, {state: {"assignments": assignments}});
   }

  useEffect(() => {
    const retrieveAssignments = async() => {
      try {
        const response = await fetch(`/lti/api/assignments/get_course_assignments?course_id=${COURSE_ID}`, {method: 'GET'})
        const completedPrequizzesRequest = await fetch(`/lti/api/assignments/student_has_completed_prequizzes/${USER_ID}?course_id=${COURSE_ID}`, {method: 'GET'})
        const modulesWithCompletedPrequizzes = await completedPrequizzesRequest.json()

        const data = await response.json()

        for (let i = 0; i < data.length; i++) {

          if (data[i].assessment_type != "prequiz" && !modulesWithCompletedPrequizzes.includes(data[i].associated_module)) {
            data[i].is_locked = true;
          }

          if (new Date(data[i].start_date).valueOf() > new Date().valueOf()) {
            data[i].is_locked = true;
          }

          try {
            const assignmentAttemptResponse = await fetch(`/lti/api/assignments/get_current_assignment_attempt/${data[i].id}?user_id=${USER_ID}`, {method: 'GET'})

            if (response.ok) {
              const assignmentAttemptData = await assignmentAttemptResponse.json()
              data[i].assignment_attempt = assignmentAttemptData   
            }
          } catch (error) {
            console.log("Error fetching assignment attempt")
            console.log(error)
          }
          if (new Date(data[i].end_date).valueOf() < new Date().valueOf()) {
              data[i].assignment_is_late = true;
          }
          
          data[i].start_date = formatTimestamp(data[i].start_date)
          data[i].end_date = formatTimestamp(data[i].end_date)
        }


        setAssignments(data);
      } catch (error) {
        console.log(error)
        console.log("Sorry, an error occurred!")
      } finally {
        setLoading(false);
      }
    }

    retrieveAssignments();
  }, [])

  
  if (loading) {
    return (<LoadingPage/>)
  }

  return (
    <main>
      <header className='bg-blue-400 p-8 flex flex-col gap-2 pl-10'>
        <Title white>Welcome to COSTAL</Title>
        <h2 className='text-white text-xl font-semibold'>{COURSE_NAME}</h2>
        <CourseInfo white />
      </header>
      <section>
        <h3 className='text-xl font-medium text-slate-900 ml-8 py-4'>Schedule</h3>
        <section className='bg-white rounded-xl border border-slate-300 mx-8'>
          <table className='w-full text-center'>
            {assignments.map((assignment, index) => {
              const isLast = index === assignments.length - 1;
              return (<tr 
                key={assignment.id} 
                className={`${
                  !isLast ? 'border-b border-slate-300' : ''
                } text-slate-700 text-sm font-medium ${assignment.is_locked ? 'opacity-50 pointer-events-none' : ''}`}
              >
                <td className='p-4 text-left'>{assignment.name}</td>
                {assignment.assignment_is_late ?
                  <td className='align-middle text-center'>
                    <article className='flex items-center justify-center gap-2 mr-8'>
                        <AlertCircle />
                        <p className='underline decoration-dashed decoration-red-500 text-red-500 underline-offset-4 text-sm'>{assignment.end_date}</p>
                    </article>
                  </td> : 
                  <td className='underline decoration-dashed underline-offset-4'>{assignment.end_date}</td>
                }
                <td>
                  <button onClick={() => navigateToAssignment(assignment.id)}>
                    {getIcon(assignment)}
                  </button>
                </td>
            </tr> )
            }
            )}
          </table>
        </section>
      </section>
    </main>
  );
};

export default LandingPage;
