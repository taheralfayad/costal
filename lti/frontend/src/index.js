import React from "react";
import ReactDOM from "react-dom/client";
import './index.css';
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import App from "./app";
import SelectObjectives from "./instructor/pages/SelectObjectives";
import CourseOutline from "./instructor/pages/CourseOutline";
import CreateAssignment from "./instructor/pages/CreateAssignment";

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
    path: '/lti/select_objectives/',
    element: <SelectObjectives/>,
  },
  {
    path: '/lti/course_outline/',
    element: <CourseOutline/>,
  },
  {
    path: '/lti/create_assignment/:moduleId',
    element: <CreateAssignment/>,
  }
])

ReactDOM.createRoot(document.getElementById("root")).render(
  <RouterProvider router={router} />
);