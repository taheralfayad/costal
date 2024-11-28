import React from 'react';
import AddQuestions from './instructor/pages/AddQuestions.js';
import AssignmentPreview from './instructor/pages/AssignmentPreview.js';
import CreateAssignment from './instructor/pages/CreateAssignment.js'
import CreateQuestion from './instructor/pages/CreateQuestion.js';
import OpenSourceHw from './instructor/pages/OpenSourceHw.js';

const App = () => {
  return (
    <div className="App">
      {/* <CreateAssignment />
      <AddQuestions /> 
      <CreateQuestion /> 
      <AssignmentPreview />*/}
      <OpenSourceHw />
    </div>
  );
}

export default App;
