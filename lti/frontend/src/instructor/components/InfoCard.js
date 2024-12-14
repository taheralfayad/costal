import React from 'react';

const InfoCard = ({ icon, title, description, long=true}) => {
  return (
    <article className={`w-72 p-6 ${long ? 'w-[430px]' : 'py-10'} justify-between items-center bg-white rounded-xl border border-slate-300 flex`}>
      <section className='flex items-center gap-2'>
        {icon}
        <h3>{title}</h3>
      </section>
      <p>{description}</p>
    </article>
  );
};

export default InfoCard;