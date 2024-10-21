import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import App from "./app";

const router = createBrowserRouter([
  {
    path: '/lti/launch/',
    element: <App/>
  },
])

ReactDOM.createRoot(document.getElementById("root")).render(
  <RouterProvider router={router} />
);