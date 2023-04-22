import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import { createHashRouter, RouterProvider } from 'react-router-dom'
import { PersistGate } from 'redux-persist/integration/react'
import 'antd/dist/reset.css'
import { persistor, store } from './state/store'
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
    <PersistGate loading="Загрузка..." persistor={persistor}>
      <Provider store={store}>
        <RouterProvider router={router} />
      </Provider>
    </PersistGate>
  </React.StrictMode>
)
