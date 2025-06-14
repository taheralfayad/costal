import React from 'react';
import katex from "katex";


const CorrectAnswer = ({ correctAnswer }) => {
    return (
        <article>
            <label className="text-slate-900 text-base font-semibold">Correct Answers</label>
            <p className="w-full h-16 p-4 text-slate-700 text-base font-medium mt-4
            bg-gray-100 rounded-md border border-gray-200 justify-start items-start gap-2.5 inline-flex" dangerouslySetInnerHTML={{
                __html: katex.renderToString(
                  typeof correctAnswer === "string"
                    ? correctAnswer
                    : correctAnswer.join(", "),
                  { throwOnError: false }
                ),
              }} ></p>
        </article>
    );
}

export default CorrectAnswer;