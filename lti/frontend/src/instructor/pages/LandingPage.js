import React, {useEffect, useState} from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Title, CircularProgressChart } from '../../design-system';
import HomeworkGradesChart from '../components/HomeworkGradesChart';
import CourseInfo from '../components/CourseInfo';
import LoadingPage from "../components/LoadingPage.js";

const LandingPage = () => {
    const [assignments, setAssignments] = useState([]);
    const [quizzes, setQuizzes] = useState([]);
    const [prequizzes, setPrequizzes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [weeklyData, setWeeklyData] = useState([]);
    const [chartsData, setChartsData] = useState([]);
    const navigate = useNavigate();


    const getWeeklyHomeworkAverage = async () => {
        try {
            const response = await fetch(`/lti/api/assignments/get_weekly_homework_average/?course_id=${COURSE_ID}`);
            const data = await response.json();
            console.log(data.assignments)
            setWeeklyData(data.assignments);

        } catch (error) {
            console.log("Error fetching weekly homework average");
        }
    };

    const getOverallGrade = async () => {
        try {
            let response = await fetch(`/lti/api/assignments/get_overall_grade/?course_id=${COURSE_ID}&type=Quiz`)
            const quizData = await response.json();

            let charts = [{
                percentage: quizData.overall_average_grade,
                label: 'Quiz Avg',
            }]
            
            response = await fetch(`/lti/api/assignments/get_overall_grade/?course_id=${COURSE_ID}&type=Homework`)
            
            const hwData = await response.json();

            charts.push({
                percentage: hwData.overall_average_grade,
                label: 'Homework Avg',
            })
            

            setChartsData(charts)
            
        } catch (error) {
            console.log(error);
        }
    };

    const getCourseAssignments = async () => {
        try {
          const response = await fetch(`/lti/api/assignments/get_course_assignments/?course_id=${COURSE_ID}`);
          const data = await response.json();
          console.log(data)
          const assignments = data.filter(assignment => assignment.assessment_type === 'Homework');
          const quizzes = data.filter(assignment => assignment.assessment_type === 'Quiz');
          const prequizzes = data.filter(assignment => assignment.assessment_type === 'prequiz');
          setAssignments(assignments);
          setQuizzes(quizzes);
          setPrequizzes(prequizzes);
        } catch (error) {
          console.log("An error occurred, please try again later!")
        } finally {
          setLoading(false)
        }
    }

    useEffect(() => {
        getCourseAssignments();
        getWeeklyHomeworkAverage()
        getOverallGrade()
    }
    , []);


    if (loading) {
      return(<LoadingPage/>)
    }


    return (
        <main className='p-6 pl-10 flex flex-col gap-8'>
            <header className='flex items-center justify-between'>
                <article className='flex flex-col gap-2'>
                    <Title>Welcome to COSTAL</Title>
                    <h2 className='text-slate-950 text-xl font-semibold'>{COURSE_NAME}</h2>
                    <CourseInfo />
                </article>
                <Button type='blackOutline' label='Settings' onClick={() => navigate('/lti/course_settings/')}/>
            </header>
            <section>

                <section className='flex items-center justify-between'>
                    <section className='w-3/5'>
                        <h3 className='text-2xl font-medium mb-4'>Course Outline</h3>
                        <section className='flex justify-around w-full'>
                            <article className='text-center'>
                                <h4 className='text-6xl font-normal'>{assignments.length}</h4>
                                <p className='text-lg font-medium'>Homeworks</p>
                            </article>
                            <article className='text-center'>
                                <h4 className='text-6xl font-normal'>{quizzes.length}</h4>
                                <p className='text-lg font-medium'>Quiz</p>
                            </article>
                            <article className='text-center'>
                                <h4 className='text-6xl font-normal'>{prequizzes.length}</h4>
                                <p className='text-lg font-medium'>Prequiz</p>
                            </article>

                        </section>
                    </section>
                    <Button type='blackOutline' label='Manage' onClick={() => navigate('/lti/course_outline')}/>
                </section>

            </section>
            <section className='flex gap-8 items-center'>
                {weeklyData && <HomeworkGradesChart data={weeklyData} /> }
                <article className='flex gap-10'>
                    {chartsData.map((chart, index) => (
                        <CircularProgressChart
                            percentage={chart.percentage}
                            label={chart.label}
    
                        />
                    ))}
                </article>
            </section>
        </main>
    );
};

export default LandingPage;
