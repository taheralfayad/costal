import React, { useState } from 'react';
import ChevronDown from '../../assets/chevron-down.svg';
import Logo from '../../assets/fish.svg';
import { useNavigate } from 'react-router-dom';

const SideMenu = ({ isMenuOpen, assignments }) => {
  const [isExpanded, setExpanded] = useState(false)
  const navigate = useNavigate()

  const toggleSubMenu = () => {
    setExpanded(!isExpanded)
  }

  const handleOpenTextbookList = () => {
    navigate(`/lti/textbook_list/${COURSE_ID}`);
  };

  return (
    <aside
      className={`fixed top-0 left-0 h-full bg-emerald-500 text-white w-64 transform ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'
        } transition-transform duration-300`}
    >
      <nav className='flex flex-col p-4'>
        <article className='h-20'>
          <div className='absolute top-0 left-0 z-20'>
              {isMenuOpen && <Logo className='w-20 h-20 z-50'/>}
          </div>
        </article>
        <a className='py-2 px-4 hover:bg-emerald-600 rounded font-medium cursor-pointer'
          onClick={() => navigate(`/lti/launch/`)}
        >
          Home
        </a>
        <a className='py-2 px-4 hover:bg-emerald-600 rounded font-medium cursor-pointer'
          onClick={handleOpenTextbookList}>
          Textbook
        </a>
        <section>
          <button
            onClick={toggleSubMenu}
            className='w-full flex justify-between items-center py-2 px-4 hover:bg-emerald-600 rounded font-medium'
          >
            <span>Assignments</span>
            <span>{isExpanded ? <ChevronDown className='text-white rotate-180' /> : <ChevronDown className=' text-white' />}</span>
          </button>
          {isExpanded && (
            <section className='ml-4 flex flex-col pt-2'>
              { /*<a
                className='py-2 px-4 hover:bg-emerald-600 rounded font-medium'
              >
                Great Assignment
              </a> */}
              {assignments.map((assignment) => (
                <a
                  key={assignment.id}
                  className='py-2 px-4 hover:bg-emerald-600 rounded font-medium cursor-pointer'
                  onClick={() => navigate(`/lti/assignment_landing/${assignment.id}`, { state: { assignments: assignments } })}
                >
                  {assignment.name}
                </a>
              ))}
            </section>
          )}
        </section>
      </nav>
    </aside>
  );
};

export default SideMenu;