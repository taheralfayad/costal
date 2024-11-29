import React, { useState } from "react";

const Toggle = () => {
  const [isToggled, setIsToggled] = useState(false);

  const handleToggle = () => {
    setIsToggled(!isToggled);
  };

  return (
    <article
      className={`w-10 h-6 flex items-center rounded-full p-1 cursor-pointer ${
        isToggled ? "bg-emerald-400" : "bg-gray-300"
      }`}
      onClick={handleToggle}
    >
      <article
        className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform ${
          isToggled ? "translate-x-4" : "translate-x-0"
        }`}
      ></article>
    </article>
  );
};

export default Toggle;
