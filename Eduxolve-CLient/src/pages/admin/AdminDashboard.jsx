/**
 * AdminDashboard - Main admin control center
 * 
 * Features:
 * - Three action cards: Upload, Manage, Review
 * - Clean, structured layout
 * - Navigation to admin routes
 */

import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import BrutalCard from '../../components/ui/BrutalCard'
import PageWrapper from '../../components/common/PageWrapper'

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
    color: 'bg-[#FFD93D]',
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
    color: 'bg-[#6BCB77]',
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
    color: 'bg-[#4ECDC4]',
    route: '/admin/review',
    placeholder: true,
  },
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

  const handleCardClick = (action) => {
    if (!action.placeholder) {
      navigate(action.route)
    }
  }

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
          {[
            { label: 'Total Files', value: '47' },
            { label: 'Theory', value: '23' },
            { label: 'Lab', value: '24' },
            { label: 'This Week', value: '5' },
          ].map((stat) => (
            <BrutalCard key={stat.label} className="text-center py-4">
              <p className="text-3xl font-bold text-[#111111]">{stat.value}</p>
              <p className="text-sm text-[#111111]/60 mt-1">{stat.label}</p>
            </BrutalCard>
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
          <BrutalCard>
            <div className="space-y-4">
              {[
                { action: 'Uploaded', file: 'Week5_BST_Slides.pdf', time: '2 hours ago', type: 'theory' },
                { action: 'Updated', file: 'Lab3_LinkedList.py', time: '5 hours ago', type: 'lab' },
                { action: 'Deleted', file: 'Draft_Notes.md', time: '1 day ago', type: 'theory' },
                { action: 'Uploaded', file: 'Week5_Lab_Code.zip', time: '1 day ago', type: 'lab' },
              ].map((activity, index) => (
                <div
                  key={index}
                  className={`
                    flex items-center justify-between py-3
                    ${index < 3 ? 'border-b border-[#111111]/10' : ''}
                  `}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`
                        w-2 h-2 rounded-full
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
          </BrutalCard>
        </div>
      </main>
    </div>
    </PageWrapper>
  )
}

export default AdminDashboard
