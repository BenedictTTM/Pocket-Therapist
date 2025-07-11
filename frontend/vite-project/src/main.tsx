import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ClerkProvider } from "@clerk/clerk-react";
import './index.css'
import App from './MyApp'

const clerkPubKey = "pk_test_ZHluYW1pYy1lZ3JldC01LmNsZXJrLmFjY291bnRzLmRldiQ"; // from Clerk dashboard
createRoot(document.getElementById('root')!).render(
   
  <StrictMode>
    <ClerkProvider publishableKey={clerkPubKey}>
    <App />
    </ClerkProvider>
  </StrictMode>,
)
