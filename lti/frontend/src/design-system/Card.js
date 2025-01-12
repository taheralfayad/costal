import React from 'react';

const Card = ({ objective, questions, book, creator }) => {
    return (
        <article className='w-80 h-56 border rounded-lg overflow-hidden shadow-md'>
            <header className='h-28 bg-gray-900'></header>

            <main className='p-4 bg-white'>
                <section className='flex justify-between items-center'>
                    <h3 className='text-slate-800 text-base font-bold'>{objective}</h3>
                    <p className='text-slate-700 text-sm font-bold'>{questions} questions</p>
                </section>

                <p className='text-slate-800 text-sm font-medium mt-1'>
                    <span className='font-semibold'>Book:</span> {book}
                </p>
                <p className='text-slate-800 text-sm font-medium mt-1'>
                    <span className='font-semibold'>Created by:</span> {creator}
                </p>
            </main>
        </article>
    );
};

export default Card;
