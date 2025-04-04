import React, { useState } from "react";
import { FaInfoCircle } from "react-icons/fa";

const Info = ({ text }) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <div 
            className="relative flex items-center p-2"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <FaInfoCircle />
            {isHovered && (
                <div 
                    className="absolute left-6 top-0 bg-gray-100 text-gray-600 text-sm px-2 py-1 rounded-md shadow-md min-w-max inline-block"
                >
                    {text}
                </div>
            )}
        </div>
    );
}

export default Info;
