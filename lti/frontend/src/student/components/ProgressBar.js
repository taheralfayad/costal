import React from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from 'recharts';

const ProgressBar = ({ percentage }) => {
    const data = [
        {
          completed: percentage,
          remaining: 100 - percentage,
        },
      ];
    return (
        <section className='m-8'>
        <section className='w-full'>
            <ResponsiveContainer height={10} width='100%'>
                <BarChart
                    barCategoryGap='0%'
                    layout='vertical'
                    data={data}
                    margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
                >
                    <XAxis type='number' hide domain={['dataMin', 'dataMax']} />
                    <YAxis type='category' hide domain={['dataMin', 'dataMax']} />
                    <Bar dataKey='completed' stackId='a' fill='#60a5fa' radius={[10, 0, 0, 10]} />
                    <Bar dataKey='remaining' stackId='a' fill='#E0E0E0' radius={[0, 10, 10, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </section>
        </section>
    );
};

export default ProgressBar;
