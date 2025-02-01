import React, { useState } from 'react';
import { Checkbox, Input } from '../../design-system';
import Trash from '../../assets/trash-can.svg'

const MultipleChoiceConfig = () => {
    const [choices, setChoices] = useState([{ id: 1, text: '', checked: false }]);

    const handleInputChange = (id, value) => {
        setChoices((prevChoices) =>
            prevChoices.map((choice) =>
                choice.id === id ? { ...choice, text: value } : choice
            )
        );

        if (
            id === choices.length &&
            value.trim() !== '' &&
            !choices.some((choice) => choice.text === '')
        ) {
            setChoices((prevChoices) => [
                ...prevChoices,
                { id: prevChoices.length + 1, text: '', checked: false },
            ]);
        }
    };

    const handleCheckboxChange = (id) => {
        setChoices((prevChoices) =>
            prevChoices.map((choice) =>
                choice.id === id ? { ...choice, checked: !choice.checked } : choice
            )
        );
    };

    const handleRemoveChoice = (id) => {
        if (choices.length > 1) {
            setChoices((prevChoices) => prevChoices.filter((choice) => choice.id !== id));
        }
    };

    return (
        <section className='p-4 w-full'>
            <label
                className='block text-sm font-medium text-gray-700 mb-2'
            >
                Add the choices and check the checkbox to mark them as correct
            </label>
            {choices.map((choice) => (
                <article
                    key={choice.id}
                    className='flex items-center gap-2'
                >
                    <span className='pb-3'>
                        <Checkbox
                            id={`checkbox-${choice.id}`}
                            checked={choice.checked}
                            onChange={() => handleCheckboxChange(choice.id)}
                            label=''
                        />

                    </span>
                    <Input
                        id={`input-${choice.id}`}
                        placeholder='Placeholder'
                        label=''
                        value={choice.text}
                        onChange={(e) => handleInputChange(choice.id, e.target.value)}
                        width='w-full'
                    />

                    <span className='pb-4'>
                        <Trash onClick={() => handleRemoveChoice(choice.id)}
                            className='text-slate-500 hover:text-red-600' />
                    </span>
                </article>
            ))}
        </section>
    );
};

export default MultipleChoiceConfig;
