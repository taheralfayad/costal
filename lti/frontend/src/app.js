import React from 'react';
import AddQuestions from './instructor/pages/AddQuestions.js';
import AssignmentPreview from './instructor/pages/AssignmentPreview.js';
import CreateAssignment from './instructor/pages/CreateAssignment.js'
import CreateQuestion from './instructor/pages/CreateQuestion.js';
import OpenSourceHw from './instructor/pages/OpenSourceHw.js';
import SelectQuestions from './instructor/pages/SelectQuestions.js';
import AssignmentSettings from './instructor/pages/AssignmentSettings.js';
import EditAssignment from './instructor/pages/EditAssignment.js';
import SelectObjectives from './instructor/pages/SelectObjectives.js';

const App = () => {
  return (
    <div className="App">
      {/* <CreateAssignment />
      <AddQuestions /> 
      <CreateQuestion /> 
      <AssignmentPreview />
      <OpenSourceHw />
      <SelectQuestions /> 
      <AssignmentSettings />
      <EditAssignment /> */}
      <SelectObjectives />

    </div>
  );
}

export default App;
