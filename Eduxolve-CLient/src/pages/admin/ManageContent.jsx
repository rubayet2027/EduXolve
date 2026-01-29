/**
 * ManageContent - Content management page
 * 
 * Features:
 * - Content list view
 * - Edit/Delete actions (mocked)
 * - Filter by type
 * - Confirmation dialogs
 */

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import BrutalCard from '../../components/ui/BrutalCard'
import BrutalButton from '../../components/ui/BrutalButton'
import PageWrapper from '../../components/common/PageWrapper'
import { ContentCard, ConfirmDialog } from '../../components/admin'

// Mock content data
const initialContent = [
  {
    id: '1',
    title: 'Week 5 - Binary Search Trees',
    type: 'theory',
    week: 5,
    topic: 'Binary Search Trees',
    tags: ['algorithms', 'trees', 'searching'],
  },
  {
    id: '2',
    title: 'Lab 5 - BST Implementation',
    type: 'lab',
    week: 5,
    topic: 'Binary Search Trees',
    tags: ['python', 'implementation', 'trees'],
  },
  {
    id: '3',
    title: 'Week 4 - Linked Lists',
    type: 'theory',
    week: 4,
    topic: 'Linked Lists',
    tags: ['data structures', 'lists'],
  },
  {
    id: '4',
    title: 'Lab 4 - Linked List Operations',
    type: 'lab',
    week: 4,
    topic: 'Linked Lists',
    tags: ['python', 'implementation'],
  },
  {
    id: '5',
    title: 'Week 3 - Recursion',
    type: 'theory',
    week: 3,
    topic: 'Recursion',
    tags: ['algorithms', 'recursion', 'fundamentals'],
  },
  {
    id: '6',
    title: 'Lab 3 - Recursive Algorithms',
    type: 'lab',
    week: 3,
    topic: 'Recursion',
    tags: ['python', 'recursion'],
  },
  {
    id: '7',
    title: 'Week 2 - Arrays and Strings',
    type: 'theory',
    week: 2,
    topic: 'Arrays and Strings',
    tags: ['data structures', 'arrays', 'strings'],
  },
  {
    id: '8',
    title: 'Week 1 - Introduction to DSA',
    type: 'theory',
    week: 1,
    topic: 'Introduction',
    tags: ['fundamentals', 'overview'],
  },
]

function ManageContent() {
  const navigate = useNavigate()
  const [content, setContent] = useState(initialContent)
  const [filter, setFilter] = useState('all') // all, theory, lab
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, item: null })
  const [editDialog, setEditDialog] = useState({ isOpen: false, item: null })
  const [successMessage, setSuccessMessage] = useState('')

  const filteredContent = content.filter((item) => {
    if (filter === 'all') return true
    return item.type === filter
  })

  const handleEdit = (item) => {
    setEditDialog({ isOpen: true, item })
  }

  const handleDelete = (item) => {
    setDeleteDialog({ isOpen: true, item })
  }

  const confirmDelete = () => {
    setContent((prev) => prev.filter((item) => item.id !== deleteDialog.item.id))
    setDeleteDialog({ isOpen: false, item: null })
    showSuccess('Content deleted successfully')
  }

  const confirmEdit = () => {
    setEditDialog({ isOpen: false, item: null })
    showSuccess('Content updated successfully')
  }

  const showSuccess = (message) => {
    setSuccessMessage(message)
    setTimeout(() => setSuccessMessage(''), 3000)
  }

  return (
    <PageWrapper>
      <div className="min-h-screen bg-[#FAFAF7]">
        {/* Header */}
        <header className="border-b-2 border-[#111111] bg-white">
          <div className="max-w-5xl mx-auto px-6 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="font-bold text-2xl text-[#111111]">
                  Manage Content
                </h1>
                <p className="text-[#111111]/60 text-sm mt-1">
                  View and edit course materials
                </p>
              </div>
              <div className="flex items-center gap-3">
                <BrutalButton
                  variant="primary"
                  onClick={() => navigate('/admin/upload')}
                >
                  + Upload New
                </BrutalButton>
                <button
                  onClick={() => navigate('/admin')}
                  className="
                    px-4 py-2
                    text-sm font-medium
                    text-[#111111]
                    bg-white
                    border-2 border-[#111111]
                    rounded-lg
                    shadow-[2px_2px_0_#111111]
                    transition-all duration-150
                    hover:-translate-x-0.5 hover:-translate-y-0.5
                    hover:shadow-[4px_4px_0_#111111]
                    cursor-pointer
                  "
                >
                  ← Dashboard
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-5xl mx-auto px-6 py-8">
          {/* Success Message */}
          <AnimatePresence>
            {successMessage && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="
                  mb-6 p-4
                  bg-[#6BCB77]
                  border-2 border-[#111111]
                  rounded-xl
                  shadow-[4px_4px_0_#111111]
                  flex items-center gap-3
                "
              >
                <svg className="w-5 h-5 text-[#111111]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="font-medium text-[#111111]">{successMessage}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Filter Tabs */}
          <div className="flex items-center gap-4 mb-6">
            <span className="text-sm font-medium text-[#111111]/60">Filter:</span>
            <div className="flex gap-2">
              {[
                { key: 'all', label: 'All', count: content.length },
                { key: 'theory', label: 'Theory', count: content.filter((c) => c.type === 'theory').length },
                { key: 'lab', label: 'Lab', count: content.filter((c) => c.type === 'lab').length },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key)}
                  className={`
                    px-4 py-2
                    text-sm font-medium
                    border-2 border-[#111111]
                    rounded-lg
                    transition-all duration-150
                    cursor-pointer
                    ${filter === tab.key
                      ? 'bg-[#111111] text-white shadow-none'
                      : 'bg-white text-[#111111] shadow-[2px_2px_0_#111111] hover:shadow-[3px_3px_0_#111111]'
                    }
                  `}
                >
                  {tab.label}
                  <span className="ml-1 opacity-60">({tab.count})</span>
                </button>
              ))}
            </div>
          </div>

          {/* Content Stats */}
          <BrutalCard className="mb-6 py-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-[#111111]/60">
                Showing <span className="font-semibold text-[#111111]">{filteredContent.length}</span> items
              </span>
              <span className="text-[#111111]/60">
                Sorted by week (newest first)
              </span>
            </div>
          </BrutalCard>

          {/* Content List */}
          <div className="space-y-4">
            {filteredContent.length > 0 ? (
              filteredContent.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.04 }}
                >
                  <ContentCard
                    content={item}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                </motion.div>
              ))
            ) : (
              <BrutalCard className="text-center py-12">
                <svg className="w-16 h-16 mx-auto text-[#111111]/30 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                <h3 className="font-bold text-lg text-[#111111] mb-2">
                  No content found
                </h3>
                <p className="text-[#111111]/60 mb-6">
                  {filter === 'all' 
                    ? "You haven't uploaded any content yet."
                    : `No ${filter} content available.`
                  }
                </p>
                <BrutalButton onClick={() => navigate('/admin/upload')}>
                  Upload Content
                </BrutalButton>
              </BrutalCard>
            )}
          </div>
        </main>

        {/* Delete Confirmation Dialog */}
        <ConfirmDialog
          isOpen={deleteDialog.isOpen}
          title="Delete Content"
          message={`Are you sure you want to delete "${deleteDialog.item?.title}"? This action cannot be undone.`}
          confirmText="Delete"
          confirmVariant="danger"
          onConfirm={confirmDelete}
          onCancel={() => setDeleteDialog({ isOpen: false, item: null })}
        />

        {/* Edit Confirmation Dialog */}
        <ConfirmDialog
          isOpen={editDialog.isOpen}
          title="Edit Content"
          message={`Editing "${editDialog.item?.title}". In a full implementation, this would open an edit form.`}
          confirmText="Save Changes"
          confirmVariant="primary"
          onConfirm={confirmEdit}
          onCancel={() => setEditDialog({ isOpen: false, item: null })}
        />
      </div>
    </PageWrapper>
  )
}

export default ManageContent
