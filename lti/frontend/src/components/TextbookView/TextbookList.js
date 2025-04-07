import React, {useState, useEffect} from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../design-system/Button.js';
import SideMenu from '../../student/components/SideMenu.js';
import Arrow from '../../assets/arrow-left.svg';


const TextbookList = () => {
  const [textbooks, setTextbooks] = useState([]);
  const [isMenuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTextbooks = async () => {
      try {
        const response = await fetch(`/lti/api/textbooks/course/${COURSE_ID}/`);
        const data = await response.json();
        setTextbooks(data);
      } catch (error) {
        console.error("Failed to fetch textbooks:", error);
      }
    };

    fetchTextbooks();
  }, []);

  useEffect(() => {
  }, [textbooks]);
  

  const goBackToLanding = () => {
    navigate('/lti/student_landing/')
  }

  const handleOpenTextbook = (isbn) => {
    navigate(`/lti/textbook/${isbn}`);
  };
    return (
        <div className=" pb-6 bg-backgroundGray min-h-screen">
          <header className="w-full bg-emerald-400 text-white py-4 shadow-md mb-4 relative">
            <div className="max-w-6xl mx-auto px-6 relative">
              <button className="absolute left-0 ml-2 top-1/2 transform -translate-y-1/2" onClick={() => goBackToLanding()}>
                <Arrow className='w-5 h-5' />
              </button>
              <h1 className="text-2xl font-bold text-center">My Textbooks</h1>
            </div>
          </header>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mx-4">
            {textbooks.map((textbook) => (
              <div
                key={textbook.isbn}
                className="bg-white border border-gray-600 shadow-sm rounded-lg p-4 flex flex-col justify-between"
              >
                <div>
                  <h2 className="text-lg font-semibold text-textDarkGray">
                    {textbook.title}
                  </h2>
                  <p className="text-sm text-textGray">By {textbook.author}</p>
                  <p className="text-sm text-textGray">
                    Published on: {new Date(textbook.published_date).toLocaleDateString()}
                  </p>
                </div>
                <Button
                  onClick ={() => handleOpenTextbook(textbook.isbn)}
                  label='View'
                  >
                  View
                </Button>
              </div>
            ))}
          </div>
        </div>
      );
};

export default TextbookList;
