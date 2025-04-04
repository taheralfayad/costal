import React, {useEffect, useState} from 'react';
import User from '../../assets/user.svg';
import Calendar from '../../assets/calendar.svg';

const CourseInfo = ({white = false}) => {
    const [professorName, setProfessorName] = useState('');
    const [start, setStart] = useState('')
    const [end, setEnd] = useState('')

    const getProfessorName = async () => {
        const response = await fetch(`/lti/api/get_course_professor_name/?course_id=${COURSE_ID}`);
        const data = await response.json();
        console.log(data.start, data.end)
        setProfessorName(data.professor);
        setStart(formatDate(data.start));
        setEnd(formatDate(data.end));
    }

    function formatDate(dateString) {
        if (!dateString) {
            return ''
        }
        const date = new Date(dateString);
    
        const options = { 
            timeZone: "America/New_York", 
            year: "numeric", 
            month: "short", 
            day: "numeric"
        };
    
        return new Intl.DateTimeFormat("en-US", options).format(date);
    }

    useEffect(() => {
        getProfessorName();
    }, []);

    return (
        <article className='flex flex-col gap-2'>
            <section className='flex'>
                <User className={`${white ? 'text-white' : 'text-slate-600' } `} />
                <p className={`${white ? 'text-white' : 'text-slate-600'} text-base font-medium`}>{professorName}</p>
            </section>
            <section className='flex'>
                <Calendar className={`${white ? 'text-white' : 'text-slate-600' } `} />
                <p className={`${white ? 'text-white' : 'text-slate-600'} text-base font-medium`}>{start} - {end}</p>
            </section>
        </article>
    );
};

export default CourseInfo;