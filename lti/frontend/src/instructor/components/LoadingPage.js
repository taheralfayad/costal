import React from 'react';
import Loading from "../../assets/loading.gif"

const LoadingPage = () => {
  return (
    <div className="flex justify-center items-center h-screen">
      <img src={Loading} alt="Loading..." className="w-24 h-24" />
    </div>
  )
}


export default LoadingPage;
