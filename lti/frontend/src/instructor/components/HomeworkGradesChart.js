import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts';

// this was HORRIBLE

const HomeworkGradesChart = ({ data }) => {

  console.log(data)
  const getColor = (grade) => (grade >= 70 ? '#60a5fa' : '#93c5fd');
  return (
    <article className="w-[400px] h-96">
      <h3 className="text-slate-950 text-lg font-medium">Homework Grades</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 20, right: 30, left: -30, bottom: 0 }} barCategoryGap="60%">
          <CartesianGrid strokeWidth={0.2} stroke="#94a3b8"  vertical={false} />
          <XAxis tickLine={false} axisLine={false} dataKey="name" interval={0} tick={{ fontSize: '12px', fill: "#94a3b8" }} />
          <YAxis tickLine={false} axisLine={false} ticks={[0, 20, 40, 60, 80, 100]} domain={[0, 100]} tick={{ fontSize: '12px', fill: "#94a3b8" }} />
          <Tooltip cursor={false} />
          <Bar dataKey="grade" fill="#4ade80" barSize={20} radius={[10, 10, 10, 10]}>
            {data.map((entry, index) => (
              <Cell key={index} fill={getColor(entry.grade)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </article>
  );
};

export default HomeworkGradesChart;
