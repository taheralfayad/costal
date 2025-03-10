import React from 'react';
import Loading from "../../assets/loading.gif"

const LoadingPage = () => {
  return (
    <div className="flex justify-center items-center h-screen">
      <img src={Loading} alt="Loading..." className="w-16 h-16" />
    </div>
  )
}


export default LoadingPage;
