import React from 'react';
import { Checkbox } from '../../design-system';

const Topic = ({ chapter, topic, description }) => {
    return (
        <article>
            <h4 className='text-gray-700 text-sm font-medium mb-2'>
                {chapter}
            </h4>
            <section className='border rounded-lg p-4 shadow-sm bg-white mb-4'>
                <p className='ttext-gray-800 text-sm font-medium mb-2'>{description}</p>
                <Checkbox label={topic} />
            </section>
        </article>

    );
};

export default Topic;
