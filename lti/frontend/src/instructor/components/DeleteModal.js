import React from 'react';
import Alert from '../../assets/alert.svg';
import { Button } from '../../design-system';

const DeleteModal = ({ isOpen, onClose, onDelete, nameOfObjectToDelete, objectType, modalType }) => {
    if (!isOpen) return null;

    const handleBackdropClick = (e) => {
        if (e.target.id === 'modal-backdrop') {
            onClose();
        }
    };

    return (
        <main id='modal-backdrop' className='fixed inset-0 z-50 flex items-center justify-center bg-gray-200 bg-opacity-50' onClick={handleBackdropClick}>
            <article className='bg-white rounded-lg p-6 h-[350px] w-[400px] shadow-lg flex flex-col justify-between items-center text-center gap-2'>
                <Alert />
                <h2 className='text-xl font-bold text-slate-800'>
                    {modalType === 'DELETE_FROM_ASSIGNMENT' ? 'Remove Question from Assignment' : `Delete ${objectType.charAt(0).toUpperCase() + objectType.slice(1).toLowerCase()}`}
                </h2>
                <p className='text-base text-slate-600'>
                    {modalType === 'DELETE_FROM_ASSIGNMENT' 
                        ? `Are you sure you want to remove ${nameOfObjectToDelete} from this assignment? The question will still be available in the question bank.`
                        : `Are you sure you want to delete ${nameOfObjectToDelete}? All student data related to this ${objectType.toLowerCase()} will be lost. You and your students will not be able to access this ${objectType.toLowerCase()} or related data again.`}
                </p>
                <section className='flex gap-4'>
                    <Button type='softGray' label='Cancel' className='px-10' onClick={onClose} />
                    <Button type='red' label={modalType === 'DELETE_FROM_ASSIGNMENT' ? 'Remove' : 'Delete'} className='px-10' onClick={onDelete} />
                </section>
            </article>
        </main>
    );
};

export default DeleteModal;