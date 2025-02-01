import React, { useState } from 'react';
import { Input } from '../../design-system';
import Trash from '../../assets/trash-can.svg'
import ChevronDown from '../../assets/chevron-down.svg';

const ShortAnswerConfig = () => {
    const [items, setItems] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [isListVisible, setIsListVisible] = useState(true);

    const handleAddItem = (e) => {
        e.preventDefault()
        if (inputValue.trim() !== '') {
            setItems([...items, inputValue])
            setInputValue('')
        }
    };

    const handleRemoveItem = (index) => {
        setItems(items.filter((_, i) => i !== index))
    };

    const toggleListVisibility = () => {
        setIsListVisible(!isListVisible)
    };

    return (
        <section className='p-4 w-full'>
            <section className='flex items-center'>
            <form onSubmit={handleAddItem} className='mb-4 w-full mr-4'>
                <Input
                    label='Accepted Answers'
                    placeholder='Great Answer'
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                />
            </form>

            <button
                    onClick={toggleListVisibility}
                    className={` transform transition-transform ${
                        isListVisible ? '' : 'rotate-[180deg]'
                      }`}
                >
                    <ChevronDown />
                </button>
            </section>

            {isListVisible && (
                <ul className='flex flex-col gap-2 mb-4'>
                    {items.map((item, index) => (
                        <li
                            key={index}
                            className='flex items-center justify-between p-2 border rounded-md bg-white shadow'
                        >
                            <p className='text-sm font-medium text-gray-700'>{item}</p>
                            <Trash onClick={() => handleRemoveItem(index)}
                                className='text-slate-500 hover:text-red-600' />

                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
}


export default ShortAnswerConfig;