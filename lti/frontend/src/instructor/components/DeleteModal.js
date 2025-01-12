import React from 'react';
import Alert from '../../assets/alert.svg';
import { Button } from '../../design-system';

const DeleteModal = ({ isOpen, onClose, onDelete }) => {
  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target.id === 'modal-backdrop') {
      onClose()
    }
  }

  return (
    <main id='modal-backdrop' className='fixed inset-0 z-50 flex items-center justify-center bg-gray-200 bg-opacity-50' onClick={handleBackdropClick}>
      <article className='bg-white rounded-lg p-6 h-[350px] w-[400px] shadow-lg flex flex-col justify-between items-center text-center gap-2'>
        <Alert />
        <h2 className='text-xl font-bold'>Delete Assignment</h2>
        <p className='text-base text-slate-500'>
          Are you sure you want to delete “Topic”? All student data related to this assignment will be lost. You and your students will not be able to access this assignment or related data again.
        </p>
        <section className='flex gap-4'>
          <Button type='softGray' label='Cancel' className='px-10' onClick={onClose} />
          <Button type='red' label='Delete' className='px-10' onClick={onDelete} />
        </section>
      </article>
    </main>
  );
};

export default DeleteModal