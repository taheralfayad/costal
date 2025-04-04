import React from 'react';


const PopupModal = ({isLoading, input, setModalShow}) => {
   return (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
         <div className="bg-white rounded-xl shadow-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-semibold mb-4">Hint</h2>
            <p className="text-gray-700 mb-4">
               {isLoading ? 'Loading...' : input}
            </p>
            <button
            className="bg-green-500 text-white px-4 py-2 rounded-full hover:bg-green-600"
            onClick={() => {setModalShow(false);}}
            >
            Close
            </button>
         </div>
      </div>
   );
}

export default PopupModal;
