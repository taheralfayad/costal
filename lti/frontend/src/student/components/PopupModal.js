import React from 'react';

const PopupModal = ({ isLoading, input, setModalShow }) => {
   return (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
         <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-semibold mb-4">Hint</h2>
            {isLoading ? (
               <p className="text-gray-700 mb-4">Loading...</p>
            ) : (
               <p
                  className="text-gray-700 mb-4"
                  dangerouslySetInnerHTML={{ __html: input }}
               />
            )}
            <button
                className="bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600"
                onClick={() => { setModalShow(false); }}
            >
                Close
            </button>
         </div>
      </div>
   );
};

export default PopupModal;
