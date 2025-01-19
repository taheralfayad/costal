import React, {useEffect, useState} from 'react';
import { Button, Title, CircularProgressChart } from '../../design-system';
import HomeworkGradesChart from '../components/HomeworkGradesChart';
import CourseInfo from '../components/CourseInfo';

const LandingPage = () => {
    const [professorName, setProfessorName] = useState('');
    const [assignments, setAssignments] = useState([]);
    const [quizzes, setQuizzes] = useState([]);

    const chartsData = [
        {
            percentage: 85,
            label: 'Homework Avg',
        },
        {
            percentage: 75,
            label: 'Quiz Avg',
        },
    ]

    const getCourseAssignments = async () => {
        const response = await fetch(`/lti/api/assignments/get_course_assignments/?course_id=${COURSE_ID}`);
        const data = await response.json();
        console.log(data);

        const assignments = data.filter(assignment => assignment.assessment_type === 'Homework');
        const quizzes = data.filter(assignment => assignment.assessment_type === 'Quiz');
        setAssignments(assignments);
        setQuizzes(quizzes);
    }

    const getProfessorName = async () => {
        const response = await fetch(`/lti/api/get_course_professor_name/?course_id=${COURSE_ID}`);
        const data = await response.json();
        setProfessorName(data.professors[0]);
    }

    useEffect(() => {
        getProfessorName();
        getCourseAssignments();
    }
    , []);


    return (
        <main className='p-6 pl-10 flex flex-col gap-8'>
            <header className='flex items-center justify-between'>
                <article className='flex flex-col gap-2'>
                    <Title>Welcome to COSTAL</Title>
                    <h2 className='text-slate-950 text-xl font-semibold'>{COURSE_NAME}</h2>
                    <CourseInfo professorName={professorName}/>
                </article>
                <Button type='blackOutline' label='Settings' />
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

                        </section>
                    </section>
                    <Button type='blackOutline' label='Manage' />
                </section>

            </section>
            <section className='flex gap-8 items-center'>
                <HomeworkGradesChart />
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
