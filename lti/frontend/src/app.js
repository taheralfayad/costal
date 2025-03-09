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
import CourseSettings from './instructor/pages/CourseSettings.js';
import CourseOutline from './instructor/pages/CourseOutline.js';
import StatsOverall from './instructor/pages/StatsOverall.js';
import StatsStudent from './instructor/pages/StatsStudent.js';
import StatsHw from './instructor/pages/StatsHw.js';
import HwDone from './student/pages/HwDone.js';
import LandingPage from './instructor/pages/LandingPage.js';
import AssignmentLanding from './student/pages/AssignmentLanding.js';
import ActivityDetails from './student/pages/ActivityDetails.js';
import Assignment from './student/pages/Assignment.js';
import StudentLanding from './student/pages/LandingPage.js'
import Button from './design-system/Button.js';
import { useNavigate } from 'react-router-dom';


const App = () => {
  const navigate = useNavigate();
  const assignment = {
    "id": 3,
    "name": "The greatest assignment of all time",
    "course": "1",
    "start_date": "2025-01-01T01:01",
    "end_date": "2025-01-02T01:01",
  }

  return (
    <div className="App">
      {/* <CreateAssignment />
      <AddQuestions assignment={assignment}/>
      <Assignment />
      <CreateQuestion /> 
      <AssignmentPreview />
      <OpenSourceHw />
      <SelectQuestions /> 
      <AssignmentSettings />
      <EditAssignment /> 
      <SelectObjectives />
      <LandingPage />
      <CourseSettings /> 
      <CourseOutline />
      <StatsOverall /> 
      <StatsStudent /> 
      <StatsHw /> 
      <HwDone />
      <LandingPage /> 
      <AssignmentLanding percentageTotal={20} />
      <ActivityDetails /> */}
      {/* <CreateQuestion assignment={assignment}/> */}
      {/* <Assignment />
      <LandingPage />
      <ActivityDetails /> 
      <Assignment /> 
      <CourseOutline/> */}
      <Button onClick={() => navigate('/lti/course_settings/')}>CLICK</Button>
    </div>
  );
}

export default App;
