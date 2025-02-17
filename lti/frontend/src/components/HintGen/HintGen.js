import React, { useState } from 'react';
import PopupModal from '../PopupModal/PopupModal.js';


const HintGen = (input) =>{
    const [hint, setHint] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [modalShow, setModalShow] = useState(false);

    const handleInvokerClick = async () => {
        setHint('');
        setIsLoading(true);
        console.log('Question:', input);
        try {
            const response = await fetch('http://localhost:8000/generate_hint', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: input.question,
                }),
            });
            if (!response.ok) {
                throw new Error('Network response error');
            }
            const data = await response.json();
            setHint(data.hint);
        } catch (error) {
            console.error('Error:', error);
        }
        finally {
            setIsLoading(false);
        }
    };    

    return (
        <div>
            <button 
                className="bg-green-500 text-white px-3 py-3 rounded-full text-sm hover:bg-green-600"
                onClick={() => {
                    if(hint !== ''){
                        setModalShow(true);
                    }
                    else {
                        handleInvokerClick();
                        setModalShow(true);
                    }
                }}
            >
                Hint
            </button>
            {modalShow && (
            <PopupModal 
            isLoading={isLoading} 
            input={hint} 
            setModalShow={setModalShow}>
            </PopupModal>
            )}
        </div>
    );
};

export default HintGen;


