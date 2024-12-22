import React from 'react';
import Search from '../assets/search.svg';

const SearchBar = ({ placeholder, onChange }) => {
    return (
        <section className='relative w-full mb-4'>
            <input
                type='text'
                placeholder={placeholder || 'Search...'}
                onChange={onChange}
                className='w-full p-2 pl-4 pr-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500'
            />
            <span className='absolute right-2 top-3 text-gray-400'>
                <Search />
            </span>
        </section>
    );
}

export default SearchBar;