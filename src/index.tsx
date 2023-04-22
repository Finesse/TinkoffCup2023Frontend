import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import { createHashRouter, RouterProvider } from 'react-router-dom'
import { store } from './state/store'
import Accounts from './view/pages/Accounts'
import Main from './view/pages/Main'

const router = createHashRouter([
  {
    path: '/',
    element: <Accounts />
  },
  {
    path: '/:accountId',
    element: <Main />
  }
])

const root = ReactDOM.createRoot(document.getElementById('root')!)
root.render(
  // todo: Добавить ErrorBoundary
  <React.StrictMode>
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  </React.StrictMode>
)
