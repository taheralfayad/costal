import React, { useState, useRef, useEffect } from 'react';
import Dots from '../../assets/dots-vertical.svg';
import DeleteModal from './DeleteModal';
import DropdownMenuItem from './DropdownMenuItem';

const DropdownMenu = ({ deleteFunction, editFunction, addQuestionFunction, name, objectType = 'ASSIGNMENT', handleDeleteFromAssignment }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState('DELETE_ITEM');
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
        setModalType('DELETE_ITEM');
        setIsModalOpen(true);
        setIsOpen(false);
    };

    const handleDeleteFromAssignmentClick = () => {
        setModalType('DELETE_FROM_ASSIGNMENT');
        setIsModalOpen(true);
        setIsOpen(false);
    };

    const handleDelete = () => {
        if (modalType === 'DELETE_FROM_ASSIGNMENT') {
            handleDeleteFromAssignment();
        } else {
            deleteFunction();
        }
        setIsModalOpen(false);
    };

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
                    {objectType === 'ASSIGNMENT' && (
                        <>
                            <DropdownMenuItem label='View' onClick={addQuestionFunction} />
                            <DropdownMenuItem label='Add question' onClick={addQuestionFunction} />
                        </>
                    )}
                    {objectType === 'QUESTION' && (
                        <DropdownMenuItem label='Delete from Assignment' onClick={handleDeleteFromAssignmentClick} />
                    )}
                    <DropdownMenuItem label='Delete' onClick={handleDeleteItem} />
                    <DropdownMenuItem label='Edit' onClick={editFunction} />
                </article>
            )}

            <DeleteModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onDelete={handleDelete}
                name={name}
                objectType={objectType}
                modalType={modalType}
            />
        </article>
    );
};

export default DropdownMenu;