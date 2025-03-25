import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Input, Title } from '../../design-system';
import ChapterDropdown from '../components/ChapterDropdown';
import LoadingPage from '../components/LoadingPage.js';
import Trash from '../../assets/trash-can.svg';


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


    try {
      const response = await fetch(`/lti/api/modules/add_objective_to_module/${moduleId}/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: newObjective }),
      });

      if (response.ok) {
        retrieveModules()
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

  const handleDeleteObjective = async (id) => {
    console.log(id)
    try {
      const formData = new FormData();
      formData.append('skill_id', id);

      const response = await fetch(`/lti/api/skills/delete_skill/`, {
        method: 'POST',
        body: formData
      });

      if (response.status === 204) {
        retrieveModules()
      }
    }
    catch (error) {
      console.error(error);
    }
  }

  console.log(module.skills)
  if (loading) {
    return (<LoadingPage />)
  }

  return (
    <main className='p-4 pl-10 flex flex-col gap-4'>
      <Title>Select Objectives</Title>

      <section className='flex justify-between items-top'>
        <section className='w-3/5'>
          {modules && modules.map((module) => {

            return (
              <ChapterDropdown chapterTitle={module.name} key={module.id}>
                {module.skills &&
                  module.skills.map((topic) => (
                    <section className='flex gap-2 justify-between'>
                      <article className='border w-[90%] rounded-lg p-4 shadow-sm bg-white mb-4'>
                        <p className='text-gray-800 text-sm font-medium'>{topic.name}</p>
                      </article>
                      <span className='pt-4'>
                        <Trash onClick={() => handleDeleteObjective(topic.id)}
                          className='text-slate-500 hover:text-red-600' />
                      </span>
                    </section>
                  ))}

                <Input label="Add Objective" value={moduleObjectives[module.id] || ''} onChange={(e) => handleInputChange(module.id, e.target.value)} />
                <Button label="Save" onClick={() => handleAddObjective(module.id)} />
              </ChapterDropdown>
            );
          })}

        </section>

      </section>


      <section className='flex justify-end gap-2 pr-4'>
        <Button label='Go back' onClick={() => navigate('/lti/course_outline')} />
      </section>

    </main>
  );
}

export default SelectObjectives;
