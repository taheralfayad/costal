import React, { useState, useRef, useEffect } from 'react';
import Dots from '../../assets/dots-vertical.svg';
import DeleteModal from './DeleteModal';
import DropdownMenuItem from './DropdownMenuItem';


const DropdownMenuModule = ({ deleteFunction, editFunction, addQuestionFunction, idOfObject, nameOfObject }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleDeleteItem = () => {
        setIsModalOpen(true);
        setIsOpen(false);
    }

    const handleDelete = () => {
        deleteFunction(idOfObject);
        setIsModalOpen(false);
    };

    const handleEditObject = () => {
        editFunction(idOfObject);
    }

    const handleAddQuestion = () => {
        console.log('idOfObject', idOfObject);
        addQuestionFunction(idOfObject);
    }

    return (
        <article className='relative inline-block text-left' ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className='p-2 relative focus:outline-none'
            >
                <Dots className='text-gray-700 hover:text-black focus:text-black' />
            </button>

            {isOpen && (
                <article className='z-50 py-1 absolute right-2 mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200'>
                    <DropdownMenuItem label='View' onClick={handleAddQuestion} />
                    <DropdownMenuItem label='Add question' onClick={handleAddQuestion}/>
                    <DropdownMenuItem label='Delete' onClick={handleDeleteItem} />
                    <DropdownMenuItem label='Edit' onClick={handleEditObject}/>
                </article>
            )}

            <DeleteModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onDelete={handleDelete}
                nameOfObjectToDelete={nameOfObject}
            />
        </article>
    );
};

export default DropdownMenuModule;
