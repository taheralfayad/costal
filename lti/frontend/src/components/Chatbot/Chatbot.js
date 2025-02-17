import React, { useState } from 'react';

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    setInput(e.target.value);
  };

 const sendMessage = async () => {
    if (!input) return;

    setMessages([...messages, { user: 'Me', text: input }]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:8000/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: input,
        }),
      });

      if (!response.ok) {
        throw new Error('Network Response Error');
      }

      const data = await response.json();
      setMessages((prevMessages) => [
        ...prevMessages,
        { user: 'CostalAI', text: data.reply },
      ]);
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages((prevMessages) => [
        ...prevMessages,
        { user: 'CostalAI', text: 'Sorry, something went wrong.' },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-80 bg-gray-100 rounded-3xl shadow-md overflow-hidden">
      <div className="max-h-72 overflow-y-auto p-4 space-y-4 text-center text-md">
        <strong>Ask CostalAI</strong>
        {messages.map((msg, index) => (
          <div 
          key={index} 
          className={`w-fit max-w-[80%] p-2 rounded-3xl ${
            msg.user === 'Me' 
              ? 'bg-green-200 ml-auto text-right' 
              : 'bg-gray-300 mr-auto text-left'
          }`}
        >
          {msg.user === 'CostalAI' && <strong>CostalAI: </strong>}
          {msg.text}
        </div>
        ))}
        {isLoading && <div className="text-center text-gray-500">Loading...</div>}
      </div>
      <div className="flex items-center p-4 border-t border-gray-300">
        <input
          type="text"
          value={input}
          onChange={handleInputChange}
          placeholder="Ask a question!"
          className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={sendMessage}
          className="ml-4 p-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default Chatbot;

