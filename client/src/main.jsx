import React from 'react';
import ReactDOM from 'react-dom/client';

import './index.css';

import { PrivyProvider } from '@privy-io/react-auth';

import App from './App';
import { createBrowserRouter } from "react-router";
import { RouterProvider } from "react-router/dom";
import Dashboard from './Dashboard';
import PaymentPage from './components/PaymentPage';

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
  {
    path: "/dashboard",
    element: <Dashboard />,
  },
  {
    path: "/pay/:shareableLink",
    element: <PaymentPage />,
  },
]);

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <PrivyProvider appId="cmi1mj25803uwjj0cqs21ias9"
      config={{
        // Create embedded wallets for users who don't have a wallet
        embeddedWallets: {
          ethereum: {
            createOnLogin: 'users-without-wallets'
          }
        }
      }}>
      <RouterProvider router={router} />

    </PrivyProvider>
  </React.StrictMode>
);