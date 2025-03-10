import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts';

// this was HORRIBLE

const HomeworkGradesChart = () => {
  const data = [
    { name: 'HW 1', grade: 7 },
    { name: 'HW 2', grade: 4 },
    { name: 'HW 3', grade: 5 },
    { name: 'HW 4', grade: 8 },
    { name: 'HW 5', grade: 6 },
    { name: 'HW 6', grade: 9 },
    { name: 'HW 7', grade: 7 },
  ];

  const getColor = (grade) => (grade >= 7 ? '#34D399' : '#a7f3d0');
  return (
    <article className="w-[400px] h-96">
      <h3 className="text-slate-950 text-lg font-medium">Homework Grades</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 20, right: 30, left: -30, bottom: 0 }} barCategoryGap="60%">
          <CartesianGrid strokeWidth={0.2} stroke="#94a3b8" vertical={false} />
          <XAxis tickLine={false} axisLine={false} dataKey="name" interval={0} tick={{ fontSize: '12px', fill: "#94a3b8" }} />
          <YAxis tickLine={false} axisLine={false} ticks={[2, 4, 6, 8, 10]} domain={[0, 2, 10]} tick={{ fontSize: '12px', fill: "#94a3b8" }} />
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
