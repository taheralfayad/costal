import React from "react";

const StatsCard = ({ objectives, questions, points }) => {
  return (
    <article className="w-1/3 border rounded-lg p-4 shadow-sm border-slate-300 bg-white flex justify-around items-center text-center">
        <section>
          <p className="text-base font-medium text-slate-500">Objectives</p>
          <p className="text-2xl font-bold text-slate-900">{objectives}</p>
        </section>
        <section>
          <p className="text-base font-medium text-slate-500">Questions</p>
          <p className="text-2xl font-bold text-slate-900">{questions}</p>
        </section>
        <section>
          <p className="text-base font-medium text-slate-500">Points</p>
          <p className="text-2xl font-bold text-slate-900">{points}</p>
        </section>
    </article>
  );
};

export default StatsCard;
