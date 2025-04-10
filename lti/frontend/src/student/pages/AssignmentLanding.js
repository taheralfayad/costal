import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Badge, Button, CircularProgressChart, Title } from '../../design-system';
import Arrow from '../../assets/arrow-left.svg';
import StarDark from '../../assets/star-dark.svg';
import Menu from '../../assets/menu-alt.svg';
import Cat from '../../assets/cat.svg';
import LoadingPage from "../../instructor/components/LoadingPage.js"
import TaskSummary from '../components/TaskSummary';
import Objective from '../components/Objective';
import SideMenu from '../components/SideMenu';
import Info from '../../design-system/Info';

const AssignmentLanding = ({ percentageTotal }) => {
    const [isMenuOpen, setMenuOpen] = useState(false)
    const [assignment, setAssignment] = useState(null)
    const [objectivesData, setObjectivesData] = useState(null)
    const [numberOfQuestionsInAssignment, setNumberOfQuestionsInAssignment] = useState(0)
    const [assignmentAttempt, setAssignmentAttempt] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    const [questionLastAttempted, setQuestionLastAttempted] = useState(null)

    const { assignments } = useLocation().state || { assignments: [] }

    const { assignmentId } = useParams()

    const navigate = useNavigate()

    const formatTimeStamps = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: true
        });
    };

    useEffect(() => {
      const fetchAssignments = async () => {
        setIsLoading(true);
        try {
          let assignment = await fetch(`/lti/api/assignments/get_assignment_by_id/${assignmentId}`)
          let course = await fetch(`/lti/api/courses/get_course_by_id/${COURSE_ID}`, {method: 'GET'})
          let courseData = await course.json()
          let data = await assignment.json()

          if (courseData.late_completion === false) {
            const today = new Date()
            today.setHours(0, 0, 0, 0)
            const endDate = new Date(data.end_date)
            endDate.setHours(0, 0, 0, 0)

            if (today > endDate) {
              data.is_locked = true;
            }
          }

          if (courseData.deadline === "WEEK") {
            const today = new Date();
            today.setHours(0, 0, 0, 0); 
            const endDate = new Date(data.end_date);
            endDate.setHours(0, 0, 0, 0); 

            const weekAfterEndDate = new Date(endDate);
            weekAfterEndDate.setDate(endDate.getDate() + 7); 
            
            if (today >= weekAfterEndDate) {
              data.is_locked = true;
            }
          }
          else if (courseData.deadline == "MONTH") {
            const today = new Date();
            today.setHours(0, 0, 0, 0); 
            const endDate = new Date(data.end_date);
            endDate.setHours(0, 0, 0, 0); 

            const monthAfterEndDate = new Date(endDate);
            monthAfterEndDate.setMonth(endDate.getMonth() + 1); 
            
            if (today >= monthAfterEndDate) {
              data.is_locked = true;
            }
          }
          else if (courseData.deadline == "END_OF_SESSION") {
            console.log("TODO: Implement END_OF_SESSION deadline")
          }

          setAssignment(data)
        } catch (error) {
          console.error('Error fetching assignment:', error)
        } 
        
      }      

      fetchAssignments();
    }, [assignmentId])

    useEffect(() => {
      const retrieveAssignmentObjectives = async () => {
        try {
          const request = await fetch(`/lti/api/skills/get_skill_by_assignment_id/${assignmentId}`);
          let data = await request.json()
          let objectives = []
          let numQuestions = 0
          for (const i in data) {
            let datum = data[i];
            if (datum["questions"].length == 0) {
              continue
            }
            numQuestions += datum["questions"].length
            let tempObjective = {
              "id": datum["id"],
              "title": datum["name"],
              "percentage": 0, // TODO: figure out a way to get a percentage estimate for each objective
              "numberOfQuestions": datum["questions"].length
            }
            objectives.push(tempObjective)
          }
          const masteryRequest = await fetch(`/lti/api/assignments/get_mastery_level_per_objective/${USER_ID}?assignment_id=${assignmentId}`)
          const masteryData = await masteryRequest.json()

          for (const i in objectives) {
            let objective = objectives[i]
            objective.percentage = masteryData[objective.id]
          }

          setObjectivesData(objectives)
          setNumberOfQuestionsInAssignment(numQuestions)
        }
        catch (error) {
          console.log("Sorry, an error occurred!")
        }
      }

      retrieveAssignmentObjectives()
    }, [assignment])

    
    useEffect(() => {
      const retrieveAssignmentAttempt = async () => {
        try {
          const request = await fetch(`/lti/api/assignments/get_current_assignment_attempt/${assignmentId}?user_id=${USER_ID}`)
          const data = await request.json()
          setAssignmentAttempt(data)
        } catch (error) {
          console.log(data)
        }
      }

      retrieveAssignmentAttempt()
    }, [assignment])


    useEffect(() => {
      const retrieveLatestQuestionAttempt = async () => {
        try {
          const request = await fetch(`/lti/api/questions/retrieve_latest_question_attempt/${assignmentId}?user_id=${USER_ID}`)
          const data = await request.json()
          console.log(data)
          if (data) {
            setQuestionLastAttempted(data)
          }
        } catch (error) {
          console.log("Sorry, an error occurred!")
        }
      }
      retrieveLatestQuestionAttempt();
    }, [])


    useEffect(() => {
      if (assignment && objectivesData && assignmentAttempt && questionLastAttempted) {
        setIsLoading(false);
      }
    }, [assignment, objectivesData, assignmentAttempt, questionLastAttempted])

    const goBackToLanding = () => {
      navigate('/lti/student_landing/')
    }
    
    const goToAssignment = async () => {
      try {
        const request = await fetch(`/lti/api/questions/get_first_question_for_assignment/${assignmentId}?assignment_attempt_id=${assignmentAttempt.id}`)
        const data = await request.json()
        navigate(`/lti/assignment/${assignmentId}`, { state: {"question": data, "assignmentAttempt": assignmentAttempt, "assignment": assignment, "assignments": assignments} })
      } catch (error) {
        console.log("Sorry, this request has failed!")
      }
    }

    const renderButtonLabel = () => {
        if (assignment.is_locked) {
            return 'Assignment is Past Due'
        }
        if (assignmentAttempt.status == 0) {
            return 'Get Started'
        }
        else if (assignmentAttempt.status == 2) {
            return 'Assignment Completed'
        }
        else {
            return 'Keep Going'
        }
    }

    const calculatePercentage = () => {
      var round = Math.round
      return round(assignmentAttempt.total_grade / assignmentAttempt.possible_points * 100)
    }

    const renderStatus = () => {
        if (assignmentAttempt.status == 0) {
            return 'Not Started'
        }
        else {
            return `${calculatePercentage()}% `
        }
    }

    const renderThirdTaskSummary = () => {
        if (percentageTotal == 0) {
            return <TaskSummary title='Work Estimate' description='12 questions minimum'
                nextLine='25 questions on average'
            />
        }
        else if (percentageTotal == 100) {
            return <TaskSummary title='Grade' description='100% Credit'
            />
        }
        else {
            return <></>
        }
    }

    const renderActivity = () => {
        if (percentageTotal == 0) {
            return <section className='flex flex-col justify-center items-center gap-6 p-6'><Cat />
                <h4 className='text-slate-800 text-xl font-medium'>No activity yet</h4></section>
        }
        else {
            return <section className='flex flex-col w-full'>
                        <section className='flex w-full justify-between items-center border-b border-slate-300 p-6'>
                            <section className='flex gap-4'>
                                <StarDark />
                                <section>
                                    <h4 className='text-slate-900 text-base font-medium mb-2'>Assigned Activity</h4>
                                    <p className='text-slate-700 text-xs font-medium'>Material from Assigned Objectives</p>
                                </section>

                            </section>
                            <p className='text-slate-900 text-base font-medium'>{numberOfQuestionsInAssignment}</p>
                        </section>
                        <section className='flex w-full justify-between items-center p-4 px-8'>
                            <p className='text-slate-600 text-base font-medium'>
                              {questionLastAttempted.created_at
                                ? `Last question attempted at: ${formatTimeStamps(questionLastAttempted.created_at)}`
                                : "Assignment not yet attempted"}
                            </p>
                            <Button label='View Activity Details' type='outline' className='px-7 py-3' onClick={() => navigate(`/lti/activity_details/${assignment.id}`)} />
                        </section>
                    </section>
        }

    }

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
              <LoadingPage/>
            </div>
        )
    }

    return (
        <main>
            <SideMenu isMenuOpen={isMenuOpen} assignments={assignments}/>
            <section
                className={`flex-1 transition-all duration-300 ${isMenuOpen ? "ml-64" : "ml-0"
                    }`}
            >
                <header className='p-6 pl-10 flex flex-col gap-4'>
                    <section className='flex flex-row gap-2 ml-8'>
                        <button onClick={() => goBackToLanding()}>
                          <Arrow className='w-5 h-5' />
                        </button>
                        <p>Back to Course</p>
                    </section>
                    <section className='flex gap-2 items-center'>
                        <span onClick={() => setMenuOpen(!isMenuOpen)}><Menu /></span>
                        <Title>{assignment.name}</Title>
                    </section>
                    <section className='ml-8 flex flex-col gap-4'>
                        {assignment.assessment_type === "Homework" ? <Badge title='Homework'/> : <Badge title='Quiz'/>}

                        <section className={`flex justify-between ${(percentageTotal === 100 || percentageTotal === 0) ? 'w-3/4' : 'w-1/2'}`}>
                            <TaskSummary title='Due' description={formatTimeStamps(assignment.end_date)}/>
                            {/*<TaskSummary title='Due' description='October 11, 2024'
                                nextLine='12:00pm EST'
                            /> */}
                            <TaskSummary title='Assignment Grade' description={renderStatus()}
                            />
                            {renderThirdTaskSummary()}
                        </section>

                        <section>
                            <Button label={renderButtonLabel()} className='px-7 py-3' onClick={() => goToAssignment()} disabled={(assignmentAttempt.status === 2 || assignment.is_locked) ? true : false}/>
                        </section>
                    </section>
                </header>

                <section className='bg-[#f8f8f8] p-6'>
                    <h3 className='text-slate-900 text-lg font-medium ml-12 pb-4'>Activity</h3>
                    <section className='bg-white rounded-xl border border-slate-300 mx-8'>
                        {renderActivity()}
                    </section>
                    
                    <section className='flex'>
                      <h3 className='text-slate-900 text-lg font-medium ml-12 py-4'>Objectives</h3>
                      <Info text='Objective estimates are based on class averages, so these might change slightly as more students complete the assignment.' />
                    </section>
                    <section className='bg-white rounded-xl border border-slate-300 mx-8'>
                        <Objective subObjectives={objectivesData} />
                    </section>
                </section>
            </section>
        </main>
    );
};

export default AssignmentLanding;
