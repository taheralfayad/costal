import React, { useState } from 'react';
import WhiteStar from '../../assets/white-star.svg';
import WhiteStarFill from '../../assets/white-star-fill.svg';

const Rating = () => {
  const [rating, setRating] = useState(0)
  const [hover, setHover] = useState(0)

  return (
    <article className='flex'>
      {[...Array(5)].map((star, index) => {
        index += 1
        return <span onClick={() => setRating(index)}
          onMouseEnter={() => setHover(index)}
          onMouseLeave={() => setHover(rating)} >{index <= (hover || rating) ? <WhiteStarFill /> : <WhiteStar />}</span>
      })}
    </article>
  );
};

export default Rating;