import React, { useEffect, useState } from 'react';
import { Button, Title } from '../../design-system';
import { useNavigate, useParams } from 'react-router-dom';
import NavCard from '../components/NavCard';
import SelectQuestion from '../components/SelectQuestion';
import DeleteModal from '../components/DeleteModal';

const SelectQuestions = () => {
  const { moduleId, assignmentId } = useParams();
  const [questions, setQuestions] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedQuestionId, setSelectedQuestionId] = useState(null);
  const [selectedQuestionName, setSelectedQuestionName] = useState('');
  const [name, setName] = useState('');
  const [assignmentName, setAssignmentName] = useState('');
  const navigate = useNavigate();

  const getQuestions = async () => {
    try {
      const response = await fetch(`/lti/api/modules/get_questions_by_module/${moduleId}/${assignmentId}`);
      const data = await response.json();
      console.log(data)
      setName(data.name)
      setAssignmentName(data.assignment_name)
      setQuestions(data.questions);
    } catch (error) {
      console.error('Error fetching questions:', error);
    }
  }

  useEffect(() => {
    getQuestions();
  }, []);

  const handleAddQuestion = async (questionId) => {
    try {
      const formData = new FormData();
      formData.append('question_id', questionId);
      formData.append('assignment_id', assignmentId);
      const response = await fetch(`/lti/api/assignments/add_question/`, {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error('Failed to add question');
      }


      console.log('Question added successfully');
    } catch (error) {
      console.error('Error adding question:', error);
    }
  };

  const handleDeleteQuestion = async (questionId) => {
    try {
      const formData = new FormData();
      formData.append('question_id', questionId);
      formData.append('assignment_id', assignmentId);

      const response = await fetch(`/lti/api/questions/delete_question_from_assignment/`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to delete question');
      }

    } catch (error) {
      console.error('Error deleting question:', error);
    }
  }

  const handleOpenModal = (questionId, questionName) => {
    setSelectedQuestionId(questionId);
    setSelectedQuestionName(questionName)
    setIsModalOpen(true);
  }

  const handleDeleteForever = async (questionId) => {
    try {
      const formData = new FormData();
      formData.append('question_id', questionId);
      formData.append('assignment_id', assignmentId);

      const response = await fetch(`/lti/api/questions/delete_question/`, {
        method: 'POST',
        body: formData
      });

      if (response.status === 204) {
        setIsModalOpen(false)
        getQuestions()
      }
    }
    catch (error) {
      console.error(error);
    }
  }


  return (
    <main className='p-6 pl-10 flex flex-col gap-4'>
      <Title>Select Questions for {assignmentName}</Title>
      <NavCard description={name} />
      
      {questions.map((q) => (
        <SelectQuestion title={q.name} possibleAnswers={q.possible_answers} key={q.id} question={q.text} value={q.is_selected} correctAnswer={q.possible_answers.reduce((acc, ans) => {
          if (ans.is_correct) acc.push(ans.answer);
          return acc;
        }, [])} onEdit={() => navigate(`/lti/edit_question/${q.id}`)} onAdd={() => handleAddQuestion(q.id)}  onDelete={() => handleDeleteQuestion(q.id)} onDeleteForever={() => handleOpenModal(q.id, q.name)} />
      ))}
      
      <section className='flex justify-end gap-2 pr-2'>
        <Button label='Done' onClick={() => navigate(`/lti/add_questions/${assignmentId}`)} />
      </section>

      <DeleteModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onDelete={() => handleDeleteForever(selectedQuestionId)}
        name={selectedQuestionName}
        objectType='QUESTION'
        modalType='DELETE_ITEM'
      />
    </main>
  );
};

export default SelectQuestions;