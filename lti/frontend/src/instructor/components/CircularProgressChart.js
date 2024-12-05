import React from 'react';
import { RadialBarChart, RadialBar, PolarAngleAxis, ResponsiveContainer } from 'recharts';

// i love stackoverflow actually
const CircularProgressChart = ({ percentage, label }) => {
    const data = [
        { name: 'Completed', value: percentage },
    ];
    return (
        <article className='relative w-44 h-44'>
            <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart
                    cx="50%"
                    cy="50%"
                    innerRadius="85%"
                    outerRadius="100%"
                    barSize={8}
                    data={data}
                    startAngle={0}
                    endAngle={360}
                >
                    <PolarAngleAxis
                        type="number"
                        domain={[0, 100]}
                        angleAxisId={0}
                        tick={false}
                    />
                    <RadialBar
                        background={{
                            fill: "#ECF3FE"
                        }}
                        clockWise
                        dataKey="value"
                        cornerRadius={50}
                        fill="#34D399"
                    />

                </RadialBarChart>
            </ResponsiveContainer>
            <section className="absolute inset-0 flex flex-col items-center justify-center">
                <h4
                    className="text-3xl font-bold text-emerald-500"

                >
                    {percentage}%
                </h4>
                <p className="text-gray-500 text-sm font-semibold">{label}</p>
            </section>
        </article>
    );
};

export default CircularProgressChart;
