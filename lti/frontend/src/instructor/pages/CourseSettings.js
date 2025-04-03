import React, { useEffect, useState } from 'react';
import { Button, Dropdown, Input, Title } from '../../design-system';
import Toggle from '../../design-system/Toggle';
import Arrow from '../../assets/arrow-left.svg';
import { useNavigate } from 'react-router-dom';

const DeadlineType = {
    WEEK: { value: 'WEEK', label: 'a week later' },
    MONTH: { value: 'MONTH', label: 'a month later' },
    END_OF_SESSION: { value: 'END_OF_SESSION', label: 'end of session' }
}

const CourseSettings = () => {
    const navigate = useNavigate();
    const [partialCompletion, setPartialCompletion] = useState(false)
    const [lateCompletion, setLateCompletion] = useState(false)
    const [deadline, setDeadline] = useState('')
    const [penalty, setPenalty] = useState(0)
    const [loading, setLoading] = useState(true)


    const getCourse = async () => {
        const response = await fetch(`/lti/api/courses/get_course_by_id/${COURSE_ID}`);
        const resData = await response.json();
        console.log(resData)
        setPartialCompletion(resData.partial_completion);
        setLateCompletion(resData.late_completion)
        setDeadline(resData.deadline)
        setPenalty(resData.penalty * 100)
        setLoading(false)
    }

    useEffect(() => {
        getCourse();

    }, []);

    useEffect(() => {
        if (!loading) {
            handleUpdateSettings()
        }
    }, [partialCompletion, lateCompletion, deadline, penalty])

    const handleUpdateSettings = async () => {
        const formData = new FormData();
        formData.append('partial_completion', partialCompletion);
        formData.append('late_completion', lateCompletion);
        formData.append('deadline', deadline);
        formData.append('penalty', penalty / 100);
        console.log(formData)

        await fetch(`/lti/api/courses/edit_settings/${COURSE_ID}/`, {
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

    const getDeadlineLabel = (value) => {
        const deadline = Object.values(DeadlineType).find(item => item.value === value);
        return deadline ? deadline.label : '';
    }
    
    return (
        <main className='p-6 pl-10 flex flex-col gap-6'>
            <header className='flex gap-14'>
                <span className='flex flex-row gap-2'>
                    <button onClick={() => navigate('/lti/landing_page/')}>
                        <Arrow className='mt-1 mr-2' />
                    </button>
                    <Title>Course Settings</Title>
                </span>
            </header>
            <h2 className='text-slate-950 text-2xl font-semibold'>Grading</h2>
            <section className='flex items-center justify-between mb-6'>
                <section>
                    <h3 className='text-slate-900 text-lg font-semibold leading-7'>Award credit for partial completion of assignments</h3>
                    <p className='text-slate-600 text-base font-medium'>Record student mastery at due date for partially completed assignments</p>
                </section>
                <Toggle color='bg-slate-800' isToggled={partialCompletion} setIsToggled={setPartialCompletion} />
            </section>
            <section className='flex items-center justify-between mb-6'>
                <section>
                    <h3 className='text-slate-900 text-lg font-semibold leading-7'>Allow late completion for assignments</h3>
                    <p className='text-slate-600 text-base font-medium'>Students can turn in completed assignments after the due date</p>
                </section>
                <Toggle color='bg-slate-800' isToggled={lateCompletion} setIsToggled={setLateCompletion} />
            </section>

            {lateCompletion && (<section className='ml-16'>
                <h4 className='text-slate-900 text-lg font-semibold leading-7 mb-4'>Set Final Deadline</h4>
                <section className='flex items-center gap-4'>
                    <p className='text-slate-600 text-base font-medium mb-4'>Let students turn in completed assignments up to</p>
                    <article className='w-1/3'>
                        <Dropdown
                            label=''
                            placeholder={getDeadlineLabel(deadline)}
                            options={[
                                {
                                    label: DeadlineType.WEEK.label,
                                    onClick: () => {
                                        setDeadline(DeadlineType.WEEK.value);
                                    }
                                },
                                {
                                    label: DeadlineType.MONTH.label,
                                    onClick: () => {
                                        setDeadline(DeadlineType.MONTH.value);
                                    }
                                },
                                {
                                    label: DeadlineType.END_OF_SESSION.label,
                                    onClick: () => {
                                        setDeadline(DeadlineType.END_OF_SESSION.value);
                                    }
                                }
                            ]}
                        />

                    </article>
                </section>
                <h4 className='text-slate-900 text-lg font-semibold leading-7 mb-4'>Penalize Late Completion</h4>
                <section className='flex items-center gap-4'>
                    <p className='text-slate-600 text-base font-medium mb-4'>Deduct a </p>
                    <Input label='' width='w-20' type='number' value={penalty} onChange={(e) => { setPenalty(e.target.value) }} />
                    <p className='text-slate-600 text-base font-medium mb-4'>% penalty upon completion</p>
                </section>
            </section>)}

        </main>
    );
};

export default CourseSettings;
