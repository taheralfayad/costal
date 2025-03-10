import React, { useState } from 'react';
import {TextArea, CorrectAnswer, Button} from '../../design-system';

const SelectQuestion = ({ question, placeholder = 'Placeholder', correctAnswer }) => {
    const [isSelected, setSelected] = useState(true);

    const handleAddClick = () => {
        setSelected(true);
    };

    const handleDeleteClick = () => {
        setSelected(false);
    };

    return (
        <div className='border rounded-lg p-6 mb-4 shadow-sm bg-white'>
            <h2 className='text-slate-900 text-base font-medium mb-2'>QUESTION</h2>
            <TextArea label={question} placeholder={placeholder} />

            <CorrectAnswer correctAnswer={correctAnswer} />

            <section className='flex justify-end gap-2 mt-4 pb-2'>
                <Button label='Feedback' type='outline' />

                {isSelected ? <Button label='Delete' type='outline' onClick={handleDeleteClick} /> : <Button label='Add' onClick={handleAddClick} />}

            </section>
        </div>
    );
};

export default SelectQuestion;
