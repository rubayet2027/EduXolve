/**
 * AdminDashboard - Main admin control center
 * 
 * Features:
 * - Real-time stats from database
 * - Three action cards: Upload, Manage, Review
 * - Recent activity from content uploads
 * - Colorful Neubrutalism design
 */

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import BrutalCard from '../../components/ui/BrutalCard'
import PageWrapper from '../../components/common/PageWrapper'
import { contentApi } from '../../services/api'

const adminActions = [
  {
    id: 'upload',
    title: 'Upload Course Content',
    description: 'Upload slides, PDFs, lab code, and notes',
    cta: 'Upload',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
      </svg>
    ),
    color: 'bg-[#FFF3CD]', // Light yellow
    borderColor: 'border-[#FFD93D]',
    route: '/admin/upload',
  },
  {
    id: 'manage',
    title: 'Manage Content',
    description: 'View and edit existing course materials',
    cta: 'Manage',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    ),
    color: 'bg-[#D4EDDA]', // Light green
    borderColor: 'border-[#6BCB77]',
    route: '/admin/content',
  },
  {
    id: 'review',
    title: 'Review AI Outputs',
    description: 'Review AI-generated materials and validation results',
    cta: 'Review',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    color: 'bg-[#D1F2EB]', // Light teal
    borderColor: 'border-[#4ECDC4]',
    route: '/admin/review',
    placeholder: true,
  },
]

// Stat card colors - lighter pastel versions
const statColors = [
  { bg: 'bg-[#FFE5E5]', accent: 'bg-[#FF6B6B]', text: 'text-[#111111]' }, // Light red
  { bg: 'bg-[#E0F7F6]', accent: 'bg-[#4ECDC4]', text: 'text-[#111111]' }, // Light teal
  { bg: 'bg-[#FFF8E1]', accent: 'bg-[#FFD93D]', text: 'text-[#111111]' }, // Light yellow
  { bg: 'bg-[#E8F5E9]', accent: 'bg-[#6BCB77]', text: 'text-[#111111]' }, // Light green
]

function AdminActionCard({ action, onClick, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.06, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <BrutalCard
        className={`
          ${action.color}
          cursor-pointer
          transition-all duration-150 ease-out
          hover:-translate-y-0.5 hover:-translate-x-0.5
          hover:shadow-[6px_6px_0px_#111111]
          active:translate-y-0.5 active:translate-x-0.5
          active:shadow-[0px_0px_0px_#111111]
          ${action.placeholder ? 'opacity-60' : ''}
          border-2 ${action.borderColor || 'border-[#111111]'}
        `}
        onClick={onClick}
      >
      <div className="flex flex-col h-full">
        {/* Icon */}
        <div className="mb-4 text-[#111111]">
          {action.icon}
        </div>

        {/* Title */}
        <h3 className="font-bold text-xl text-[#111111] mb-2">
          {action.title}
        </h3>

        {/* Description */}
        <p className="text-[#111111]/70 text-sm mb-6 flex-1">
          {action.description}
        </p>

        {/* CTA */}
        <div className="flex items-center justify-between">
          <span className="font-bold text-[#111111]">
            {action.cta}
          </span>
          <svg className="w-5 h-5 text-[#111111]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </div>

        {/* Placeholder Badge */}
        {action.placeholder && (
          <div className="mt-3 pt-3 border-t border-[#111111]/20">
            <span className="text-xs font-medium text-[#111111]/50 uppercase tracking-wide">
              Coming Soon
            </span>
          </div>
        )}
      </div>
    </BrutalCard>
    </motion.div>
  )
}

function AdminDashboard() {
  const navigate = useNavigate()
  const [stats, setStats] = useState({
    total: 0,
    theory: 0,
    lab: 0,
    thisWeek: 0
  })
  const [recentContent, setRecentContent] = useState([])
  const [loading, setLoading] = useState(true)

  // Fetch content data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await contentApi.list({ limit: 100 })
        
        if (response.success && response.data) {
          const content = response.data
          
          // Calculate stats
          const total = content.length
          const theory = content.filter(c => c.type === 'theory').length
          const lab = content.filter(c => c.type === 'lab').length
          
          // Count items from this week
          const oneWeekAgo = new Date()
          oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
          const thisWeek = content.filter(c => new Date(c.createdAt) >= oneWeekAgo).length
          
          setStats({ total, theory, lab, thisWeek })
          
          // Get recent 5 items sorted by date
          const recent = [...content]
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 5)
            .map(item => ({
              action: 'Uploaded',
              file: item.title || item.filename,
              time: getRelativeTime(item.createdAt),
              type: item.type || 'theory'
            }))
          
          setRecentContent(recent)
        }
      } catch (error) {
        console.error('Failed to fetch content:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Helper function for relative time
  const getRelativeTime = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)
    
    if (diffMins < 60) return `${diffMins} min ago`
    if (diffHours < 24) return `${diffHours} hours ago`
    if (diffDays === 1) return '1 day ago'
    return `${diffDays} days ago`
  }

  const handleCardClick = (action) => {
    if (!action.placeholder) {
      navigate(action.route)
    }
  }

  const statsData = [
    { label: 'Total Files', value: stats.total },
    { label: 'Theory', value: stats.theory },
    { label: 'Lab', value: stats.lab },
    { label: 'This Week', value: stats.thisWeek },
  ]

  return (
    <PageWrapper>
      <div className="min-h-screen bg-[#FAFAF7]">
      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-10">
        {/* Page Title */}
        <div className="mb-10">
          <h1 className="font-bold text-2xl text-[#111111]">
            Admin Dashboard
          </h1>
          <p className="text-[#111111]/60 text-sm mt-1">
            Manage course content and platform settings
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {statsData.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: index * 0.05 }}
            >
              <BrutalCard className={`text-center py-5 ${statColors[index].bg} relative overflow-hidden`}>
                {/* Accent strip on top */}
                <div className={`absolute top-0 left-0 right-0 h-1 ${statColors[index].accent}`} />
                <p className={`text-4xl font-bold ${statColors[index].text}`}>
                  {loading ? '...' : stat.value}
                </p>
                <p className={`text-sm mt-1 ${statColors[index].text} opacity-70`}>
                  {stat.label}
                </p>
              </BrutalCard>
            </motion.div>
          ))}
        </div>

        {/* Action Cards */}
        <h2 className="font-bold text-lg text-[#111111] mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {adminActions.map((action, index) => (
            <AdminActionCard
              key={action.id}
              action={action}
              index={index}
              onClick={() => handleCardClick(action)}
            />
          ))}
        </div>

        {/* Recent Activity */}
        <div className="mt-10">
          <h2 className="font-bold text-lg text-[#111111] mb-4">
            Recent Activity
          </h2>
          <BrutalCard className="bg-white">
            {loading ? (
              <div className="py-8 text-center text-[#111111]/50">
                Loading recent activity...
              </div>
            ) : recentContent.length === 0 ? (
              <div className="py-8 text-center text-[#111111]/50">
                No content uploaded yet. Start by uploading some files!
              </div>
            ) : (
              <div className="space-y-4">
                {recentContent.map((activity, index) => (
                  <div
                    key={index}
                    className={`
                      flex items-center justify-between py-3
                      ${index < recentContent.length - 1 ? 'border-b border-[#111111]/10' : ''}
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`
                          w-3 h-3 rounded-full
                          ${activity.type === 'theory' ? 'bg-[#FFD93D]' : 'bg-[#6BCB77]'}
                        `}
                      />
                      <span className="text-[#111111]">
                        <span className="font-medium">{activity.action}</span>{' '}
                        <span className="text-[#111111]/70">{activity.file}</span>
                      </span>
                    </div>
                    <span className="text-sm text-[#111111]/50">
                      {activity.time}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </BrutalCard>
        </div>
      </main>
    </div>
    </PageWrapper>
  )
}

export default AdminDashboard
