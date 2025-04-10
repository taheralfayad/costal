import React from "react";
import ReactDOM from "react-dom/client";
import './index.css';
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import App from "./app";
import SelectObjectives from "./instructor/pages/SelectObjectives";
import CourseOutline from "./instructor/pages/CourseOutline";
import CreateAssignment from "./instructor/pages/CreateAssignment";
import LandingPage from "./instructor/pages/LandingPage";
import EditAssignment from "./instructor/pages/EditAssignment";
import EditQuestion from "./instructor/pages/EditQuestion";
import CourseSettings from "./instructor/pages/CourseSettings";
import AddQuestions from "./instructor/pages/AddQuestions";
import AssignmentLanding from "./student/pages/AssignmentLanding.js";
import StudentLandingPage from "./student/pages/LandingPage.js";
import CreateQuestion from "./instructor/pages/CreateQuestion.js";
import Assignment from "./student/pages/Assignment.js";
import CreatePrequiz from "./instructor/pages/CreatePrequiz.js";
import SelectQuestions from "./instructor/pages/SelectQuestions";
import TextbookList from "./components/TextbookView/TextbookList.js";
import TextbookView from "./components/TextbookView/TextbookView.js";
import ManageTextbooks from "./instructor/pages/ManageTextbooks";


import ActivityDetails from "./student/pages/ActivityDetails.js";
import StatsOverall from "./instructor/pages/StatsOverall";
import Landing from "./landing";

const router = createBrowserRouter([
  {
    path: '/lti/launch/',
    element: <App/>,
  },
  {
    path: '/lti/oauth_complete/',
    element: <App/>,
  },
  {
    path: '/lti/add_questions/:assignmentId',
    element: <AddQuestions/>,
  },
  {
    path: '/lti/select_questions/:moduleId/:assignmentId',
    element: <SelectQuestions/>,
  },
  {
    path: '/lti/select_objectives/',
    element: <SelectObjectives/>,
  },
  {
    path: '/lti/course_outline/',
    element: <CourseOutline/>,
  },
  {
    path: '/lti/landing_page/',
    element: <LandingPage/>,
  },
  {
    path: '/lti/create_assignment/:moduleId',
    element: <CreateAssignment/>,
  },
  {
    path: '/lti/create_prequiz/:moduleId',
    element: <CreatePrequiz/>,
  },
  {
    path: '/lti/edit_assignment/:assignmentId',
    element: <EditAssignment/>,
  },
  {
    path: '/lti/course_settings/',
    element: <CourseSettings/>,
  },
  {
    path: '/lti/create_question/:assignmentId',
    element: <CreateQuestion/>,
  },
  {
    path: '/lti/assignment_landing/:assignmentId',
    element: <AssignmentLanding/>
  },
  {
    path: '/lti/edit_question/:assignmentId/:questionId',
    element: <EditQuestion/>,
  },
  {
    path: '/lti/student_landing/',
    element: <StudentLandingPage/>
  },
  {
    path: '/lti/assignment/:assignmentId',
    element: <Assignment/>
  },
  {
    path: '/lti/activity_details/:assignmentId',
    element: <ActivityDetails/>
  },
  {
    path: '/lti/stats/',
    element: <StatsOverall/>
  },
  {
    path: 'lti/textbook_list/:courseId',
    element: <TextbookList/>
  },
  {
    path: '/lti/textbook/:isbn',
    element: <TextbookView/>,
  },
  {
    path: '/lti/manage_textbooks',
    element: <ManageTextbooks/>
  }
  ,
  {
    path: '/',
    element: <Landing />

  }

])

ReactDOM.createRoot(document.getElementById("root")).render(
  <RouterProvider router={router} />
);
