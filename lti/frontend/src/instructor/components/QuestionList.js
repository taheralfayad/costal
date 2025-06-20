import React from 'react';
import { useNavigate } from 'react-router-dom';
import PreviewQuestion from "./PreviewQuestion.js";


const QuestionList = ({ assignmentId, questions, handleDeleteQuestion, handleDeleteFromAssignment }) => {
  const navigate = useNavigate();

  const difficultyMap = {
    1: "Easy",
    2: "Medium",
    3: "Hard"
  }

  return (
    <section className="h-full bg-gray-100 py-8 flex flex-col gap-4">

      {questions.map((question) => (

        <PreviewQuestion isMath={question.is_math} id={question.id} handleDeleteFromAssignment={handleDeleteFromAssignment} handleDeleteQuestion={handleDeleteQuestion} handleEditQuestion={() => navigate(`/lti/edit_question/${assignmentId}/${question.id}`)} title={question.name} points={question.num_points} percentage={difficultyMap[question.difficulty]} question={question.text} possibleAnswers={question.possible_answers} correctAnswer={question.possible_answers.reduce((acc, ans) => {
          if (ans.is_correct) acc.push(ans.answer);
          return acc;
        }, [])} type={question.type} />

      ))}

    </section>
  );
};

export default QuestionList;
