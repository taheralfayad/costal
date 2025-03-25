import React, { useState } from 'react';

import Radio from '../../design-system/Radio.js';

const RadioGroup = ({ selectedValue, options }) => { 
    return (
      <section className='flex flex-col gap-3'>
        {options.map((option) => {
          return <Radio label={option.label} checked={option.checked} onChange={option.onChange} />
        })}
      </section>
    )
}

export default RadioGroup;
