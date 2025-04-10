import React from 'react';
import Logo from './assets/logo-horizontal.svg'
import LogoWhite from './assets/logo-white.svg'
import Pencil from './assets/pencil.svg'
import Mail from './assets/envelope-white.svg'
import Adaptive from './assets/adaptive.svg'
import Graph from './assets/graph.svg'
import Macbook from './assets/macbook.png'
import Student from './assets/student.png'
import { Button } from './design-system';

const Landing = () => {
    return (
        <div>
            <nav class="flex w-screen">

                <div class="w-1/2 bg-slate-100 p-4 flex justify-between font-semibold items-center">
                    <Logo class='w-1/3' />
                    <a href='#about'>About</a>
                    <a href='#contact'>Contact</a>

                </div>

                <div class="w-1/2"></div>
            </nav>
            <header className='w-screen flex'>
                <aside className='w-1/2'>
                    <div className='bg-slate-100 pt-28 py-20 pl-12 flex flex-col gap-6 justify-between items-start'>
                        <h1 className='text-4xl font-semibold'>Combined Open Source Textbooks and Adaptive Learning</h1>
                        <p className='text-xl font-medium text-slate-700'>Better learning, better grades.</p>
                        <Button label='Get Started' onClick={() => window.location.hash = '#contact'}  />
                    </div>
                    <div className='bg-slate-100 h-40 rounded-br-[250px]'>
                    </div>
                </aside>
                <aside className='w-1/2'> <div className='py-20 pl-12 pr-6'><img src={Macbook} /></div> </aside>
            </header>
            <main className='pb-8'>
                <section id='about' className='flex py-20 px-6'>
                    <aside className='w-1/2'><div className='py-20'><img src={Student} className='rounded-md shadow-lg' /></div></aside>
                    <aside className='w-1/2 flex flex-col gap-4 p-6'>
                        <h2 className='text-3xl font-semibold'>AI that adapts to your students</h2>
                        <p className='text-xl font-medium txperience using the power of LLMs. It tailors contenext-slate-700'>Our tool personalizes your students' study et to your students needs and even generates custom questions.</p>
                        <section className='pl-4 flex flex-col gap-2'>
                            <article>
                                <h3 className='text-lg font-semibold mb-2'>Personalized learning paths</h3>
                                <p className='text-lg font-medium text-slate-700'>The tool adjusts the difficulty and focus of your students' learning journey in real time. Based on their progress, it recommends topics and adapts to their pace.</p>
                            </article>
                            <article>
                                <h3 className='text-lg font-semibold mb-2'>Generates Questions</h3>
                                <p className='text-lg font-medium text-slate-700'>The platform uses LLMs to create custom questions from your course content-but don't worry, it won't manually add them to the course, you will be the one verifying its input first.</p>
                            </article>
                            <article>
                                <h3 className='text-lg font-semibold mb-2'>Textbook Support</h3>
                                <p className='text-lg font-medium text-slate-700'>You can update your textbook and your students will be able to see it while their doing homework.</p>
                            </article>
                            <div>
                                <h3 className='text-lg font-semibold mb-2'>On-Demand Hints</h3>
                                <p className='text-lg font-medium text-slate-700'>If your student is stuck on a problem, COSTAL will geneerate hints tailored to where you're struggling—without giving away the answer. It helps guide their thinking, just like a tutor would.</p>
                            </div>
                        </section>
                    </aside>

                </section>
                <section className='flex justify-between p-6 gap-6 pt-10'>
                    <section className="p-6 bg-blue-100 rounded-md w-64 h-80">
                        <Pencil />
                        <h4 className="text-xl font-bold text-gray-900 mt-4">Build faster assignments</h4>
                        <p className="mt-2 text-gray-700">With our LLM, you can generate questions easier</p>
                    </section>

                    <section className="p-6 bg-blue-100 rounded-md w-64 h-80">
                        <Adaptive />
                        <h4 className="text-xl font-bold text-gray-900 mt-4">Improve students grades</h4>
                        <p className="mt-2 text-gray-700">Our adaptive learning model will accomodate to your students' needs</p>
                    </section>

                    <section className="p-6 bg-blue-100 rounded-md w-64 h-80">
                        <Graph />
                        <h4 className="text-xl font-bold text-gray-900 mt-4">Get insight</h4>
                        <p className="mt-2 text-gray-700">Understand how your students are doing in class</p>
                    </section>

                </section>
            </main>

            <footer id='contact' className='bg-blue-500 text-white'>
                <section className='flex justify-between p-16'>
                    <h5 className='text-2xl font-semibold pl-16'>Please feel free to get in touch with us</h5>

                    <section className='flex justify-between items-start gap-6 pr-16'>
                        <article className='pt-1' ><Mail /></article>
                        <article>
                            <h6 className='font-semibold text-lg'>How can we help?</h6>
                            <p className='font-medium text-base'>costal-learning@outlook.com</p>

                        </article>

                    </section>

                </section>

                <section className='flex flex-col items-center justify-center pb-8'>
                    <article className='w-20 h-20' ><LogoWhite /></article>
                    <p>© 2025 COSTAL. All rights reserved.</p>
                </section>
            </footer>

        </div>
    );
};

export default Landing;

