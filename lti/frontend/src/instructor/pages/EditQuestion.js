import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Checkbox, Dropdown, Input, RichTextEditor, Title } from '../../design-system';
import MultipleChoiceConfig from '../components/MultipleChoiceConfig';
import ShortAnswerConfig from '../components/ShortAnswerConfig';
import { ToastContainer, toast, Bounce } from 'react-toastify';

const EditQuestion = () => {
    const { assignmentId, questionId } = useParams();
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [text, setText] = useState('');
    const [difficulty, setDifficulty] = useState('');
    const [objectives, setObjectives] = useState([]);
    const [dropdownObjectives, setDropdownObjectives] = useState([]);
    const [objective, setObjective] = useState('');
    const [selectedCheckbox, setSelectedCheckbox] = useState(null);
    const [associatedSkill, setAssociatedSkill] = useState(0);
    const [solvingText, setSolvingText] = useState('');
    const [isMath, setIsMath] = useState(false);
    const [points, setPoints] = useState(0);
    const [multipleChoiceAnswers, setMultipleChoiceAnswers] = useState([{ id: 1, text: '', checked: false }]);
    const [shortAnswerItems, setShortAnswerItems] = useState([]);



    const transformMultipleChoiceBack = (answers) => {
        return answers.map((answer, index) => ({
            id: index + 1,
            text: answer.answer || '',
            checked: answer.is_correct || false
        }))

    }

    const transformShortAnswerBack = (answers) => {
        return answers.map(answer => {
            return answer.answer
        })
    }

    const getQuestion = async () => {
        const response = await fetch(`/lti/api/questions/get_question_by_id/${questionId}`);
        const resData = await response.json();
        setName(resData.name);
        setText(resData.text);
        setAssociatedSkill(resData.associated_skill)
        let difficulty_map = {
            1: "Easy",
            2: "Medium",
            3: "Hard"
        }
        setDifficulty(difficulty_map[resData.difficulty])
        setSelectedCheckbox(resData.type)
        setPoints(resData.num_points)
        setIsMath(resData.is_math)

        setSolvingText(resData.explanation)

        if (resData.type === 'multiple') {
            let answers = transformMultipleChoiceBack(resData.possible_answers)
            answers.push({
                id: answers.length,
                text: '',
                checked: false
            })
            setMultipleChoiceAnswers(answers)
        } else {
            setShortAnswerItems(transformShortAnswerBack(resData.possible_answers))
        }
    };

    useEffect(() => {
        getQuestion();

    }, []);

    const onSelectDifficulty = (value) => {
        setDifficulty(value)
    }

    const difficulties = [
        { "label": "Easy", "onClick": () => onSelectDifficulty("Easy") },
        { "label": "Medium", "onClick": () => onSelectDifficulty("Medium") },
        { "label": "Hard", "onClick": () => onSelectDifficulty("Hard") }
    ]

    const onSelectObjective = (value) => {
        setObjective(value)
    }

    const formatObjectivesForDropdown = () => {
        let formattedObjectivesForDropdown = []

        for (let i = 0; i < objectives.length; i++) {
            let temp = {
                "label": objectives[i].name,
                "onClick": () => onSelectObjective(objectives[i].name)
            }
            formattedObjectivesForDropdown.push(temp)
        }

        setDropdownObjectives(formattedObjectivesForDropdown)
    }

    const fetchObjectives = async () => {
        try {
            const response = await fetch(`/lti/api/skills/get_skill_by_assignment_id/${assignmentId}`);
            const data = await response.json();

            let obj = data.find(item => item.id === associatedSkill).name
            setObjective(obj)

            setObjectives(data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleCheckboxChange = (checkboxId) => {
        setSelectedCheckbox((prev) => (prev === checkboxId ? null : checkboxId));
    };

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!selectedCheckbox) {
            toast.error("Please select a question type (Short Answer or Multiple Choice)");
            return;
        }

        if (selectedCheckbox === 'multiple' && multipleChoiceAnswers.length < 2) {
            toast.error("Please add more choices to multiple choice");
            return;
        }

        if (selectedCheckbox === 'short' && shortAnswerItems.length < 1) {
            toast.error("Please add more accepted answers");
            return;
        }
        const skillID = objectives.find(item => item.name === objective).id;
        const formData = new FormData();

        formData.append('name', name);
        formData.append('skill_id', skillID);
        formData.append('difficulty', difficulty);
        formData.append('points', points);
        formData.append('text', text);
        formData.append('type', selectedCheckbox);
        formData.append('explanation', solvingText);
        formData.append('is_math', isMath);

        if (selectedCheckbox === 'multiple') {
            const multipleChoiceData = multipleChoiceAnswers.filter((choice) => choice.text.trim() !== "").map((choice) => {
                return { possible_answer: choice.text, is_correct: choice.checked };
            }
            );
            formData.append('possible_answers', JSON.stringify(multipleChoiceData));
        }
        else {
            const shortAnswerData = shortAnswerItems.map((item) => {
                return { possible_answer: item, is_correct: true };
            });
            formData.append('possible_answers', JSON.stringify(shortAnswerData));
        }

        await fetch(`/lti/api/questions/edit_question/${questionId}/`, {
            method: 'POST',
            body: formData,
        }).then((res) => {
            if (res.ok) {

                navigate(`/lti/add_questions/${assignmentId}`)
            }
        }).catch(err => {
            console.log(err.message);
        })

    };

    useEffect(() => {
        fetchObjectives();
    }, [assignmentId, associatedSkill]);

    useEffect(() => {
        formatObjectivesForDropdown();
    }, [objectives]);

    return (
        <div>
            <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop={false} closeOnClick={false} rtl={false} pauseOnFocusLoss draggable pauseOnHover theme="colored" transition={Bounce}
            />
            <form onSubmit={handleSubmit}>
                <main className='flex'>
                    <section className='p-6 pl-10 w-1/2 flex flex-col gap-4'>
                        <Title>Edit Question</Title>
                        <Input label='Name' placeholder='Great Question' value={name} onChange={(e) => setName(e.target.value)(e)} required />
                        <Dropdown label='Objective' value={objective} options={dropdownObjectives} required />
                        <Dropdown label='Difficulty' value={difficulty} options={difficulties} onSelect={(e) => setDifficulty(e)} required />
                        <RichTextEditor placeholder={text} value={text} onChange={setText} required />
                        <section className='flex flex-col gap-4'>
                            <label className='block text-sm font-medium text-gray-700'>
                                Choose your question type
                            </label>
                            <Checkbox
                                label="Short Answer"
                                checked={selectedCheckbox === 'short'}
                                onChange={() => handleCheckboxChange('short')}
                                id="short"
                            />
                            <Checkbox
                                label="Multiple Choice"
                                checked={selectedCheckbox === 'multiple'}
                                onChange={() => handleCheckboxChange('multiple')}
                                id="multiple"
                            />
                        </section>
                        <label className='block text-sm font-medium text-gray-700'>
                            Choose if your question is a math one
                        </label>
                        <Checkbox
                            label="Is Math Question"
                            checked={isMath}
                            onChange={() => setIsMath(!isMath)}
                            id="math"
                        />

                        <Input type='number' label='Points' min={1} max={15} placeholder={1} width='w-1/4' value={points} onChange={(e) => setPoints(e.target.value)} />
                    </section>
                    {selectedCheckbox &&
                        <aside className='mt-16 ml-10 w-2/5 h-1/2 flex flex-col gap-4 border border-slate-300 rounded-lg shadow-sm m-6'>
                            {selectedCheckbox === 'short' ?
                                <ShortAnswerConfig items={shortAnswerItems} setItems={setShortAnswerItems} isMath={isMath} /> :
                                <MultipleChoiceConfig choices={multipleChoiceAnswers} setChoices={setMultipleChoiceAnswers} isMath={isMath} />}

                            <section className='mx-4 mb-2'>
                                <RichTextEditor label='Add an explanation on how to solve this question' required value={solvingText} onChange={setSolvingText} />
                            </section>
                        </aside>}
                </main>
                <section className='flex justify-end gap-2 pr-4 pb-2'>
                    <Button label='Save' form={true} />
                    <Button label='Cancel' type='outline' onClick={() => navigate(`/lti/add_questions/${assignmentId}`)} />
                </section>
            </form>
        </div>
    );
}

export default EditQuestion;