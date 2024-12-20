import React from 'react';
import { RadialBarChart, RadialBar, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import EmeraldStar from '../../assets/star-fill-emerald.svg';
import SlateStar from '../../assets/star-slate.svg';

// i love stackoverflow actually
const CircularProgressChartStar = ({ percentage }) => {
    const data = [
        { name: 'Completed', value: percentage },
    ];
    return (
        <article className='relative w-14 h-14'>
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
                            fill: "#CBD5E1"
                        }}
                        clockWise
                        dataKey="value"
                        cornerRadius={50}
                        fill="#34D399"
                    />

                </RadialBarChart>
            </ResponsiveContainer>
            <section className="absolute inset-0 flex flex-col items-center justify-center">
                {percentage == 100 ? <EmeraldStar /> : <SlateStar />}
            </section>
        </article>
    );
};

export default CircularProgressChartStar;
