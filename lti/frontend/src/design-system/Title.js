import React from 'react';


const Title = ({children , white=false}) => {
  
  return (
    <h1 className={`${white ? 'text-white' : 'text-slate-950'} text-3xl font-semibold`}>{children}</h1>
  );
}

export default Title;


