import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import './index.css'
import './styles/brutal.css'
import App from './App.jsx'
import { initAuthListener, cleanupAuthListener } from './services/authListener'

// Create a React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
})

// Initialize auth listener immediately
initAuthListener()

// Root component with cleanup
function Root() {
  useEffect(() => {
    // Cleanup auth listener on unmount
    return () => cleanupAuthListener()
  }, [])

  return (
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </QueryClientProvider>
    </StrictMode>
  )
}

createRoot(document.getElementById('root')).render(<Root />)
