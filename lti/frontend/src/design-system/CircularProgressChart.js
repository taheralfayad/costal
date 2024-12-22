import React from 'react';
import { RadialBarChart, RadialBar, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import EmeraldStar from '../assets/star-fill-emerald.svg';
import SlateStar from '../assets/star-slate.svg';

const CircularProgressChart = ({
  percentage,
  label = '',
  showStar = false,
  size = 'medium', 
  barColor = '#34D399',
  backgroundColor = '#ECF3FE',
}) => {
  const data = [{ name: 'Completed', value: percentage }];

  const sizes = {
    small: 'w-14 h-14',
    medium: 'w-44 h-44',
    large: 'w-64 h-64',
  };

  return (
    <article className={`relative ${sizes[size]}`}>
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
            background={{ fill: backgroundColor }}
            clockWise
            dataKey="value"
            cornerRadius={50}
            fill={barColor}
          />
        </RadialBarChart>
      </ResponsiveContainer>
      <section className="absolute inset-0 flex flex-col items-center justify-center">
        {showStar ? (
          percentage === 100 ? <EmeraldStar /> : <SlateStar />
        ) : (
          <>
            <h4 className="text-3xl font-bold text-emerald-500">{percentage}%</h4>
            {label && <p className="text-gray-500 text-sm font-semibold">{label}</p>}
          </>
        )}
      </section>
    </article>
  );
};

export default CircularProgressChart;
