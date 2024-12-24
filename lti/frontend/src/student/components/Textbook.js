import React from 'react';
import { Button } from '../../design-system';

const Textbook = () => {
    return (
        <section className='mx-12 p-8 bg-white rounded-xl border border-slate-300 flex flex-col gap-4'>
            <h2 className='text-slate-900 text-2xl font-medium'>1.1 Real Numbers</h2>
            <article className='flex flex-col justify-center items-center gap-6 py-8 px-6'>
            Given any number n, we know that n is either rational or irrational. It cannot be both. The sets of rational and irrational numbers together make up the set of real numbers. As we saw with integers, the real numbers can be divided into three subsets: negative real numbers, zero, and positive real numbers. Each subset includes fractions, decimals, and irrational numbers according to their algebraic sign (+ or -). Zero is considered neither positive nor negative.
The real numbers can be visualized on a horizontal number line with an arbitrary point chosen as 0, with negative numbers to the left of 0 and positive numbers to the right of 0. A fixed unit distance is then used to mark off each integer (or other basic value) on either side of 0. Any real number corresponds to a unique position on the number line.The converse is also true: Each location on the number line corresponds to exactly one real number. This is known as a one-to-one correspondence. We refer to this as the real number line as shown in Figure 1.

<img className='w-1/2' src='https://s3-alpha-sig.figma.com/img/5cd5/c2eb/126d573f6650f7b6ca68a62b3d134b54?Expires=1736121600&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4&Signature=qc0~Cik0gAVTpUu~xOJ8qzQ1XWA180x8HRuaw8P~v2z-AqOX7qI4Ba4q2zvIB3Soa5fX1TjkdZvXCvJ4cpb0vJ0sX~oJDcKwuzUCuAjCed3SEiE~RpFl9tBEnh8Z8g97JUpKkkT0MqyM~9~orf46kSIoIIUj6RBYb5J06Nksn6raQ61wQwXMVqEHPyRNwDQhJDOTipcZvTIqJO1ZzHjAidP~EVLhAPK8JVf-pcwbt4OfwbNKDXop2Ux-RV0M~jWhAgknit0qhSX5sICDEUq0qxg0LFUhZ~Gx8Cp4Zk9sphO2XmZNNRjSGZ~RCUE8WxRuggmRY8LpX~iaNqUUyHCbcw__' />
            </article>
            <section className='flex justify-end'>
                <Button label='Continue' />
            </section>
        </section>
    );
};

export default Textbook;