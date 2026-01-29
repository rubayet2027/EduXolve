import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { IoBook, IoSearch, IoSparkles } from 'react-icons/io5'
import { BrutalCard, BrutalButton } from '../components/ui'
import PageWrapper from '../components/common/PageWrapper'
import heroImage from '../assets/EduXolveHero.jpeg'

// Feature data for the three brutal cards
const features = [
  {
    title: 'Organized Course Materials',
    description: 'Access structured learning content tailored to your university courses, all in one place.',
    icon: IoBook,
    iconColor: '#FF9500',
  },
  {
    title: 'Intelligent Semantic Search',
    description: 'Find exactly what you need with AI-powered search that understands context and meaning.',
    icon: IoSearch,
    iconColor: '#007AFF',
  },
  {
    title: 'AI-Generated Validated Content',
    description: 'Get reliable, verified learning materials generated and reviewed by advanced AI systems.',
    icon: IoSparkles,
    iconColor: '#AF52DE',
  },
]

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.16, 1, 0.3, 1],
    },
  },
}

function Landing() {
  const navigate = useNavigate()

  const handleSignIn = () => {
    navigate('/login')
  }

  return (
    <PageWrapper>
      <div className="min-h-screen bg-[#FAF8F5]">
        {/* Hero Section */}
        <motion.section
          className="px-6 py-24 md:py-36 relative overflow-hidden"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          {/* Background Image */}
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${heroImage})` }}
          >
            {/* Overlay for better text readability */}
            <div className="absolute inset-0 bg-[#FAF8F5]/70" />
          </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          {/* Hero Title */}
          <motion.h1
            variants={itemVariants}
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#111111] leading-tight mb-6"
          >
            AI-powered supplementary learning platform for university courses
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={itemVariants}
            className="text-lg md:text-xl text-[#111111]/70 mb-10 max-w-2xl mx-auto"
          >
            Enhance your academic journey with intelligent tools designed to help you learn smarter, not harder.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <BrutalButton
              variant="primary"
              onClick={handleSignIn}
              className="w-full sm:w-auto text-lg px-8 py-4"
            >
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Sign in with Google
              </span>
            </BrutalButton>

            <BrutalButton
              variant="neutral"
              onClick={handleSignIn}
              className="w-full sm:w-auto text-lg px-8 py-4"
            >
              Login with Email
            </BrutalButton>
          </motion.div>
        </div>
      </motion.section>

      {/* Features Section */}
      <motion.section
        className="px-6 py-20 bg-[#E8F5F0]"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-100px' }}
        variants={containerVariants}
      >
        <div className="max-w-6xl mx-auto">
          <motion.h2
            variants={itemVariants}
            className="text-3xl md:text-4xl font-bold text-[#111111] text-center mb-14"
          >
            Why EduXolve?
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const IconComponent = feature.icon
              return (
              <motion.div key={index} variants={itemVariants}>
                <BrutalCard className="h-full bg-white hover:-translate-y-1 hover:shadow-[5px_5px_0px_#111111] active:translate-y-0.5 active:translate-x-0.5 active:shadow-[0px_0px_0px_#111111] transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] cursor-pointer">
                  <div className="flex flex-col items-center text-center gap-5 py-2">
                    <IconComponent size={48} style={{ color: feature.iconColor }} />
                    <h3 className="text-xl font-bold text-[#111111]">
                      {feature.title}
                    </h3>
                    <p className="text-[#111111]/70">
                      {feature.description}
                    </p>
                  </div>
                </BrutalCard>
              </motion.div>
            )})
            }
          </div>
        </div>
      </motion.section>
    </div>
    </PageWrapper>
  )
}

export default Landing
