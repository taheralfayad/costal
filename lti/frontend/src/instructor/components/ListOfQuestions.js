import React from 'react';
import PreviewQuestion from "../components/PreviewQuestion.js";

const ListOfQuestions = ({ questions }) => {

  const difficultyMap = {
    1: "Easy",
    2: "Medium",
    3: "Hard"
  }


  return (
    <section className="h-full overflow-y-auto max-h-[500px]">
      <div className="mx-auto bg-white shadow-lg rounded-lg border">
        <ul className="space-y-4">
          {questions.map((question) => (
            <li key={question.id} className="p-4 border-b last:border-b-0">
              <h3 className="font-bold text-lg">{question.name}</h3>
              <div
                className="text-gray-700 mt-2"
                dangerouslySetInnerHTML={{ __html: question.text }}
              />
              <p className="text-sm text-gray-500 mt-2">
                Points: {question.num_points} | Difficulty: {difficultyMap[question.difficulty]}
              </p>
              {question.possible_answers.length > 0 && (
                <p className="text-green-600 mt-2">
                  Correct Answer: {question.possible_answers.find(ans => ans.is_correct)?.answer}
                </p>
              )}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default ListOfQuestions;
