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
import CourseSettings from "./instructor/pages/CourseSettings";
import AddQuestions from "./instructor/pages/AddQuestions";

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
    path: '/lti/edit_assignment/:assignmentId',
    element: <EditAssignment/>,
  },
  {
    path: '/lti/course_settings/',
    element: <CourseSettings/>,
  }
])

ReactDOM.createRoot(document.getElementById("root")).render(
  <RouterProvider router={router} />
);