import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { BrutalCard, BrutalButton } from '../components/ui'
import { ActionCard, SectionHeader } from '../components/dashboard'
import PageWrapper from '../components/common/PageWrapper'
import { logout } from '../services/auth.service'
import { useAuthStore } from '../store'

// Primary action cards data
const primaryActions = [
  {
    icon: '🔍',
    title: 'Search Course Materials',
    description: 'Find relevant slides, PDFs, and lab codes using natural language.',
    cta: 'Start Searching',
    to: '/search',
    accentColor: '#FFD93D', // Yellow
  },
  {
    icon: '🤖',
    title: 'Chat with AI',
    description: 'Ask questions, get explanations, and explore course topics conversationally.',
    cta: 'Open Chat',
    to: '/chat',
    accentColor: '#6BCB77', // Green
  },
  {
    icon: '✨',
    title: 'Generate Learning Materials',
    description: 'Create notes, slides, or lab code grounded in course content.',
    cta: 'Generate Content',
    to: '/generate',
    accentColor: '#4D96FF', // Blue
  },
]

// Mock data for continue learning section
const recentTopics = [
  { id: 1, title: 'Stacks and Queues', type: 'Recently Viewed' },
  { id: 2, title: 'Binary Trees', type: 'Recently Viewed' },
]

const suggestedTopics = [
  { id: 3, title: 'Time Complexity Analysis', type: 'Suggested' },
]

function Dashboard() {
  const navigate = useNavigate()
  const { user, role } = useAuthStore()

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/login')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  return (
    <PageWrapper>
      <div className="min-h-screen bg-[#FAFAF7]">
      {/* Header */}
      <header className="border-b-2 border-[#111111] bg-white">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Left: Course Info */}
          <div>
            <h1 className="text-2xl font-bold text-[#111111]">
              CSE 3xx — Data Structures
            </h1>
            <p className="text-[#111111]/60 text-sm">
              AI-powered supplementary learning
            </p>
          </div>

          {/* Right: Profile & Logout */}
          <div className="flex items-center gap-4">
            {/* Admin Link (if admin) */}
            {role === 'admin' && (
              <button
                onClick={() => navigate('/admin')}
                className="
                  px-3 py-1.5
                  text-xs font-semibold
                  text-[#111111]
                  bg-[#FFD93D]
                  border-2 border-[#111111]
                  rounded-lg
                  shadow-[2px_2px_0_#111111]
                  transition-all duration-150
                  hover:-translate-x-0.5 hover:-translate-y-0.5
                  hover:shadow-[3px_3px_0_#111111]
                  cursor-pointer
                "
              >
                Admin
              </button>
            )}

            {/* Profile Avatar */}
            <div className="flex items-center gap-2">
              {user?.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'Profile'}
                  className="w-10 h-10 border-2 border-[#111111] rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 bg-[#E8E8E4] border-2 border-[#111111] rounded-full flex items-center justify-center">
                  <span className="text-lg">👤</span>
                </div>
              )}
              <span className="text-sm font-medium text-[#111111] hidden sm:block">
                {user?.displayName || user?.email?.split('@')[0] || 'Student'}
              </span>
            </div>

            {/* Logout Button */}
            <BrutalButton 
              variant="neutral" 
              onClick={handleLogout}
              className="px-4 py-2 text-sm"
            >
              Logout
            </BrutalButton>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-10">
        {/* Primary Action Cards Section */}
        <section className="mb-12">
          <SectionHeader 
            title="What would you like to do?" 
            subtitle="Choose an action to get started with your learning"
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {primaryActions.map((action, index) => (
              <ActionCard
                key={action.to}
                icon={action.icon}
                title={action.title}
                description={action.description}
                cta={action.cta}
                to={action.to}
                accentColor={action.accentColor}
                index={index}
              />
            ))}
          </div>
        </section>

        {/* Continue Learning Section */}
        <section>
          <SectionHeader 
            title="Continue Learning" 
            subtitle="Pick up where you left off or explore suggested topics"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...recentTopics, ...suggestedTopics].map((topic, index) => (
              <motion.div
                key={topic.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  duration: 0.3, 
                  delay: 0.3 + index * 0.05,
                  ease: 'easeOut'
                }}
              >
                <BrutalCard className="flex items-center justify-between gap-4 p-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-[#111111]/50 uppercase tracking-wide mb-1">
                      {topic.type}
                    </p>
                    <h4 className="font-semibold text-[#111111] truncate">
                      {topic.title}
                    </h4>
                  </div>
                  <BrutalButton 
                    variant="neutral" 
                    className="px-3 py-1.5 text-sm shrink-0"
                    onClick={() => navigate('/search')}
                  >
                    Open
                  </BrutalButton>
                </BrutalCard>
              </motion.div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t-2 border-[#111111] mt-auto">
        <div className="max-w-6xl mx-auto px-6 py-4 text-center">
          <p className="text-sm text-[#111111]/50">
            EduXolve — AI-powered learning for university students
          </p>
        </div>
      </footer>
    </div>
    </PageWrapper>
  )
}

export default Dashboard
