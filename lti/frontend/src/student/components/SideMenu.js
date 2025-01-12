import React, { useState } from 'react';
import ChevronDown from '../../assets/chevron-down.svg';

const SideMenu = ({ isMenuOpen }) => {
  const [isExpanded, setExpanded] = useState(false)

  const toggleSubMenu = () => {
    setExpanded(!isExpanded)
  }

  return (
    <aside
      className={`fixed top-0 left-0 h-full bg-emerald-500 text-white w-64 transform ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'
        } transition-transform duration-300`}
    >
      <nav className='flex flex-col p-4'>
        <article className='h-20'>LOGO</article>
        <a className='py-2 px-4 hover:bg-emerald-600 rounded font-medium'>
          Home
        </a>
        <a className='py-2 px-4 hover:bg-emerald-600 rounded font-medium'>
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
              <a
                className='py-2 px-4 hover:bg-emerald-600 rounded font-medium'
              >
                Great Assignment
              </a>
              <a
                className='py-2 px-4 hover:bg-emerald-600 rounded font-medium'
              >
                Assignment 1
              </a>
              <a
                className='py-2 px-4 hover:bg-emerald-600 rounded font-medium'
              >
                Assignment 2
              </a>
            </section>
          )}
        </section>
      </nav>
    </aside>
  );
};

export default SideMenu;