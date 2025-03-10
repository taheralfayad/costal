import React, { useState } from "react";

const Toggle = ({ color = 'bg-emerald-400', isToggled, setIsToggled }) => {
  
  return (
    <article
      onClick={() => setIsToggled(!isToggled)}
      className={`w-[55px] h-8 flex items-center rounded-[30px] p-1 cursor-pointer transition-colors duration-300
        ${isToggled ? color : "bg-gray-300"}`}
    >
      <article
        className={`w-7 h-7 bg-white rounded-full shadow-md transform transition-transform duration-300
          ${isToggled ? "translate-x-[20px]" : "translate-x-0"} top-[2px]`}
      ></article>
    </article>
  );


  
};

export default Toggle;
