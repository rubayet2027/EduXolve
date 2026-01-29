import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { IoSearch, IoChatbubbles, IoSparkles } from 'react-icons/io5'
import { BrutalCard, BrutalButton } from '../components/ui'
import { ActionCard, SectionHeader } from '../components/dashboard'
import PageWrapper from '../components/common/PageWrapper'

// Primary action cards data
const primaryActions = [
  {
    icon: IoSearch,
    iconColor: '#FF9500',
    title: 'Search Course Materials',
    description: 'Find relevant slides, PDFs, and lab codes using natural language.',
    cta: 'Start Searching',
    to: '/search',
    accentColor: '#FFF0D9', // Soft butter
    buttonColor: '#FFD93D',
  },
  {
    icon: IoChatbubbles,
    iconColor: '#34C759',
    title: 'Chat with AI',
    description: 'Ask questions, get explanations, and explore course topics conversationally.',
    cta: 'Open Chat',
    to: '/chat',
    accentColor: '#E8F5EC', // Soft mint
    buttonColor: '#6BCB77',
  },
  {
    icon: IoSparkles,
    iconColor: '#007AFF',
    title: 'Generate Learning Materials',
    description: 'Create notes, slides, or lab code grounded in course content.',
    cta: 'Generate Content',
    to: '/generate',
    accentColor: '#E8F0FC', // Soft sky
    buttonColor: '#4D96FF',
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

  return (
    <PageWrapper>
      <div className="min-h-screen bg-[#FAFAF7]">
      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-12">
        {/* Primary Action Cards Section */}
        <section className="mb-14">
          <SectionHeader 
            title="What would you like to do?" 
            subtitle="Choose an action to get started with your learning"
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {primaryActions.map((action, index) => (
              <ActionCard
                key={action.to}
                icon={action.icon}
                title={action.title}
                description={action.description}
                cta={action.cta}
                to={action.to}
                accentColor={action.accentColor}                buttonColor={action.buttonColor}                index={index}
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

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...recentTopics, ...suggestedTopics].map((topic, index) => (
              <motion.div
                key={topic.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  duration: 0.25, 
                  delay: 0.3 + index * 0.04,
                  ease: [0.16, 1, 0.3, 1]
                }}
              >
                <BrutalCard className="flex items-center justify-between gap-4 p-4 bg-[#FAF8F5]">
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
    </div>
    </PageWrapper>
  )
}

export default Dashboard
