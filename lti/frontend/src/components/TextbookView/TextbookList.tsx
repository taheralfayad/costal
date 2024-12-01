import React from 'react';
import { Link } from 'react-router-dom';

// TODO: Make a change to call from the API endpoint TextbookViewSet.get_queryset() instead of using the hardcoded data.
const textbooks = [
    {
      isbn: 1,
      title: 'Introduction to Python Programming',
      author: 'Thomas H. Cormen',
      published_date: '2009-07-31',
      file: '/path-to-pdf/algorithms.pdf',
    },
    {
      isbn: 2,
      title: 'Advanced Engineering Mathematics',
      author: 'Erwin Kreyszig',
      published_date: '2011-08-20',
      file: '/path-to-pdf/engineering-math.pdf',
    },
    {
      isbn: 3,
      title: 'Modern Physics',
      author: 'Kenneth S. Krane',
      published_date: '2012-05-12',
      file: '/path-to-pdf/modern-physics.pdf',
    },
    {
      isbn: 4,
      title: 'Principles of Microeconomics',
      author: 'N. Gregory Mankiw',
      published_date: '2018-01-10',
      file: '/path-to-pdf/microeconomics.pdf',
    },
    {
      isbn: 5,
      title: 'Organic Chemistry',
      author: 'Paula Yurkanis Bruice',
      published_date: '2016-09-25',
      file: '/path-to-pdf/organic-chemistry.pdf',
    },
    {
      isbn: 6,
      title: 'Discrete Mathematics and Its Applications',
      author: 'Kenneth H. Rosen',
      published_date: '2012-03-15',
      file: '/path-to-pdf/discrete-mathematics.pdf',
    },
    {
      isbn: 7,
      title: 'Biology',
      author: 'Neil A. Campbell',
      published_date: '2014-05-01',
      file: '/path-to-pdf/biology.pdf',
    },
    {
      isbn: 8,
      title: 'Physics for Scientists and Engineers',
      author: 'Raymond A. Serway',
      published_date: '2016-01-20',
      file: '/path-to-pdf/physics-engineers.pdf',
    },
    {
      isbn: 9,
      title: 'The Art of Computer Programming',
      author: 'Donald E. Knuth',
      published_date: '2011-07-15',
      file: '/path-to-pdf/art-of-programming.pdf',
    },
    {
      isbn: 10,
      title: 'Calculus: Early Transcendentals',
      author: 'James Stewart',
      published_date: '2015-11-10',
      file: '/path-to-pdf/calculus.pdf',
    },
  ];

const TextbookList = () => {
    return (
        <div className=" pb-6 bg-backgroundGray min-h-screen">
          <header className="w-full bg-green-700 text-white py-4 shadow-md mb-4">
            <div className="max-w-6xl mx-auto flex justify-center items-center px-6">
              <h1 className="text-2xl font-bold">My Textbooks</h1>
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
                <Link
                  to={`/textbook/${textbook.isbn}`}
                  className="mt-4 bg-primaryGreen text-white text-center py-2 px-4 rounded-lg hover:bg-green-600 transition"

                  >
                    
                  View
                </Link>
              </div>
            ))}
          </div>
        </div>
      );
};

export default TextbookList;
