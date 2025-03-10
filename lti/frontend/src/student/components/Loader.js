import React from 'react';
import Globe from '../../assets/globe.svg';

const Loader = () => {
    return (
        <section className='flex flex-col justify-center items-center gap-10 pt-16'>
            <Globe />
            <h2 className='text-xl font-medium'>Loading next question</h2>
        </section>
    );
};

export default Loader;