import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { 
  Landing, 
  Login, 
  Dashboard, 
  Search, 
  Chat, 
  Generate,
  AdminDashboard,
  UploadContent,
  ManageContent,
} from './pages'

function App() {
  const location = useLocation()

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Student Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/search" element={<Search />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/generate" element={<Generate />} />

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/upload" element={<UploadContent />} />
        <Route path="/admin/content" element={<ManageContent />} />
      </Routes>
    </AnimatePresence>
  )
}

export default App
