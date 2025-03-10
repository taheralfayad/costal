import React from 'react';
import { Button, Card, Title } from '../../design-system';


const OpenSourceHw = () => {

  return (
    <main className='p-6 pl-10 flex flex-col gap-8'>
      <Title>Open Source Homeworks</Title>
      <section className='flex flex-wrap justify-around gap-8 p-y'>
        <Card objective='Objective 4.1.1' questions={12} book='Open Staxx' creator='Arup Guha' />
        <Card objective='Objective 4.1.1' questions={12} book='Open Staxx' creator='Arup Guha' />
        <Card objective='Objective 4.1.1' questions={12} book='Open Staxx' creator='Arup Guha' />
        <Card objective='Objective 4.1.1' questions={12} book='Open Staxx' creator='Arup Guha' />
        <Card objective='Objective 4.1.1' questions={12} book='Open Staxx' creator='Arup Guha' />
        <Card objective='Objective 4.1.1' questions={12} book='Open Staxx' creator='Arup Guha' />

      </section>

      <section className='flex justify-end gap-2 pr-2'>
        <Button label='Cancel' type='outline' />
      </section>
    </main>
  );
}

export default OpenSourceHw;