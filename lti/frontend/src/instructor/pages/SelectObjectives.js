import React, { useEffect, useState} from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Input, Title } from '../../design-system';
import Toggle from '../../design-system/Toggle';
import ChapterDropdown from '../components/ChapterDropdown';
import StatsCard from '../components/StatsCard';
import Topic from '../components/Topic';
import LoadingPage from '../components/LoadingPage.js';


const SelectObjectives = () => {
  const [modules, setModules] = useState([]);
  const [moduleObjectives, setModuleObjectives] = useState({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const handleInputChange = (moduleId, value) => {
    setModuleObjectives((prev) => ({
      ...prev,
      [moduleId]: value,
    }));
  };
  

  const handleAddObjective = async (moduleId) => {
    const newObjective = moduleObjectives[moduleId]?.trim();
    if (!newObjective) return; // Prevent empty submissions
  
    console.log(moduleId, newObjective);
  
    try {
      const response = await fetch(`/lti/api/modules/add_objective_to_module/${moduleId}/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: newObjective }),
      });
  
      if (response.ok) {
        const updatedModules = modules.map((module) =>
          module.id === moduleId
            ? { ...module, skills: [...module.skills, { id: Date.now(), chapter: '', name: newObjective, description: '' }] }
            : module
        );
        setModules(updatedModules);
      }
    } catch (error) {
      console.error('Error adding objective:', error);
    }
  
    // Clear the input field for this module
    setModuleObjectives((prev) => ({
      ...prev,
      [moduleId]: '',
    }));
  };

  const retrieveModules = async () => {
    try {
      const response = await fetch(`/lti/api/modules/get_modules_with_skills/${COURSE_ID}`);;
      const data = await response.json();
      setModules(data);
    } catch (error) {
      console.log("Error time!")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    retrieveModules();
  }, []);


  if (loading) {
    return (<LoadingPage/>)
  }

  return (
    <main className='p-4 pl-10 flex flex-col gap-4'>
      <Title>Select Objectives</Title>

      <section className='flex justify-between items-top'>
        <section className='w-3/5'>
          {/* <ChapterDropdown chapterTitle='Chapter 1:'>

            <Topic chapter='1.1 Lorem Ipsum' title='Lorem Ipsum' description='Lorem Ipsum' />
          </ChapterDropdown>
          <ChapterDropdown chapterTitle='Chapter 2:'>

            <Topic chapter='2.1 Lorem Ipsum' title='Lorem Ipsum' description='Lorem Ipsum' />
          </ChapterDropdown>
          <ChapterDropdown chapterTitle='Chapter 3:'>

            <Topic chapter='3.1 Lorem Ipsum' title='Lorem Ipsum' description='Lorem Ipsum' />
          </ChapterDropdown>


          <ChapterDropdown chapterTitle='Chapter 4:'>
            <Topic chapter='4.1 Linear Regression' title='Gradient Descent' description='Lorem Ipsum' />

            <Topic chapter='4.2 Logistic Regression' title='Lorem Ipsum' description='Lorem Ipsum' />
          </ChapterDropdown> */}
        {modules && modules.map((module) => {

          return (
            <ChapterDropdown chapterTitle={module.name} key={module.id}>
              {module.skills &&
                module.skills.map((topic) => (
                  <Topic topic={topic.name} />
                ))}

              <Input label="Add Objective" value={moduleObjectives[module.id] || ''} onChange={(e) => handleInputChange(module.id, e.target.value)} />
              <Button label="Save" onClick={() => handleAddObjective(module.id)} />
            </ChapterDropdown>
          );
        })}

        </section>
        <aside className='w-1/4 h-60 border border-slate-300 rounded-lg shadow-sm p-6'>
          <Input label='Questions Per Objective' type='number' min={1} max={15} />
          <section className='flex justify-between items-top'>
            <Toggle />
            <p className='w-4/5 text-slate-900 text-sm font-medium pl-1'>Toggle Only Objectives Not Assigned</p>
          </section>
        </aside>
      </section>

      <section className='flex justify-between items-center mt-6'>
        <StatsCard objectives={4} questions={4} points={4} />
        <section className='flex justify-end gap-2 pr-4'>
          <Button label='Save' />
          <Button label='Cancel' type='outline' onClick={() => navigate('/lti/course_outline')}/>
        </section>
      </section>
    </main>
  );
}

export default SelectObjectives;
