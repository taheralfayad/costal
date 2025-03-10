import React from 'react';
import { PieChart, Pie, Cell } from 'recharts';

const PieChartCard = ({ title, data, label, icon }) => (
    <div className='flex items-center bg-white rounded-xl border border-slate-300 p-4 w-[430px] justify-between'>
        <div className='flex flex-col items-start justify-center'>
            <h3 className='text-lg font-medium mb-2 text-slate-900'>{title}</h3>
            <p className='text-center font-medium text-slate-700 text-base'>{label}</p>
            <ul className='mt-4 space-y-1'>
                {data.map((item, index) => (
                    <li key={index} className='flex items-center text-sm text-slate-700 font-medium'>
                        <span
                            className='inline-block w-3 h-3 rounded-full mr-2'
                            style={{ backgroundColor: item.color }}
                        ></span>
                        {item.name} ({item.value})
                    </li>
                ))}
            </ul>
        </div>
        <div className='relative flex flex-col items-center'>
            <PieChart width={150} height={150}>
                <Pie
                    data={data}
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={2}
                    startAngle={90}
                    endAngle={-270}
                    dataKey='value'
                >
                    {data.map((entry) => (
                        <Cell fill={entry.color} />
                    ))}
                </Pie>
            </PieChart>
            <div className='absolute inset-0 flex items-center justify-center'>
                <div className='text-3xl'>{icon}</div>
            </div>
        </div>



    </div >
)

export default PieChartCard;