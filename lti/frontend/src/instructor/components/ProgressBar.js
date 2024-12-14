import React from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';


const ProgressBar = ({ data }) => {
    const transformedData = [
        {
            completed: data[0].value,
            inProgress: data[1].value,
            struggling: data[2].value,
            notStarted: data[3].value,
        }
    ]

    return (
        <section className='bg-white rounded-xl border border-slate-300 mx-8 p-6'>
            <section className='w-full'>
                <ResponsiveContainer height={70} width='100%'>
                    <BarChart
                        layout='vertical'
                        data={transformedData}
                        stackOffset='expand'
                    >
                        <XAxis hide type='number' />
                        <YAxis type='category' hide />
                        <Bar dataKey='completed' fill='#86efac' stackId='a' style={{ stroke: '#fff', strokeWidth: 4 }} />
                        <Bar dataKey='inProgress' fill='#fde68a' stackId='a' style={{ stroke: '#fff', strokeWidth: 4 }} />
                        <Bar dataKey='struggling' fill='#f87171' stackId='a' style={{ stroke: '#fff', strokeWidth: 4 }} />
                        <Bar dataKey='notStarted' fill='#94a3b8' stackId='a' style={{ stroke: '#fff', strokeWidth: 4 }} />
                    </BarChart>
                </ResponsiveContainer>
            </section>

            <section className='flex gap-6 w-full pt-4 pl-4'>
                {data.map((item) => (
                    <article className='flex items-center '>
                        <article
                            className='w-3 h-3 rounded-full'
                            style={{ backgroundColor: item.color }}
                        ></article>
                        <p className='text-sm ml-2'>
                            {item.name} ({item.value})
                        </p>
                    </article>
                ))}
            </section>
        </section>
    );
};

export default ProgressBar;
