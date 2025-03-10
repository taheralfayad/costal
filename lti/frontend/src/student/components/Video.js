import React from 'react';
import { Button } from '../../design-system';

const Video = () => {
    return (
        <section className='mx-12 p-6 bg-white rounded-xl border border-slate-300 flex flex-col gap-4'>
            <h2 className='text-slate-900 text-2xl font-medium'>How to use the Unit Circle</h2>
            <article className='flex justify-center items-center'>
                <iframe width="700" height="393" src="https://www.youtube.com/embed/gdJq1QunN-o?si=qXcYey0zD5GWR36J" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
            </article>
            <section className='flex justify-end'>
                <Button label='Continue' />
            </section>
        </section>
    );
};

export default Video;