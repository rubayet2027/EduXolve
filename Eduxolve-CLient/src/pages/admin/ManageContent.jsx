/**
 * ManageContent - Content management page
 * 
 * Features:
 * - Content list view from API
 * - Edit/Delete actions
 * - Filter by type
 * - Confirmation dialogs
 */

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import BrutalCard from '../../components/ui/BrutalCard'
import BrutalButton from '../../components/ui/BrutalButton'
import PageWrapper from '../../components/common/PageWrapper'
import { ContentCard, ConfirmDialog } from '../../components/admin'
import { SkeletonLoader } from '../../components/common/Loader'
import { contentApi } from '../../services/api'

function ManageContent() {
  const navigate = useNavigate()
  const [content, setContent] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState('all') // all, theory, lab
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, item: null })
  const [editDialog, setEditDialog] = useState({ isOpen: false, item: null })
  const [successMessage, setSuccessMessage] = useState('')

  // Fetch content on mount
  useEffect(() => {
    fetchContent()
  }, [])

  const fetchContent = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await contentApi.list()
      const contentList = response.data || response.content || response || []
      
      // Map to expected format
      const mappedContent = contentList.map(item => ({
        id: item._id || item.id,
        title: item.title || item.filename || 'Untitled',
        type: item.type || 'theory',
        week: item.week,
        topic: item.topic || '',
        tags: item.tags || [],
        filename: item.filename,
        createdAt: item.createdAt
      }))
      
      setContent(mappedContent)
    } catch (err) {
      console.error('Failed to fetch content:', err)
      setError(err.message || 'Failed to load content')
    } finally {
      setIsLoading(false)
    }
  }

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

  const confirmDelete = async () => {
    if (!deleteDialog.item) return
    
    try {
      await contentApi.delete(deleteDialog.item.id)
      setContent((prev) => prev.filter((item) => item.id !== deleteDialog.item.id))
      setDeleteDialog({ isOpen: false, item: null })
      showSuccess('Content deleted successfully')
    } catch (err) {
      console.error('Delete failed:', err)
      showSuccess('Failed to delete content')
    }
  }

  const confirmEdit = async () => {
    // In a full implementation, this would open an edit form
    // For now, just close the dialog
    setEditDialog({ isOpen: false, item: null })
    showSuccess('Edit functionality coming soon')
  }

  const showSuccess = (message) => {
    setSuccessMessage(message)
    setTimeout(() => setSuccessMessage(''), 3000)
  }

  return (
    <PageWrapper>
      <div className="min-h-screen bg-[#FAFAF7]">
        {/* Main Content */}
        <main className="max-w-5xl mx-auto px-6 py-8">
          {/* Page Title */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="font-bold text-2xl text-[#111111]">
                Manage Content
              </h1>
              <p className="text-[#111111]/60 text-sm mt-1">
                View and edit course materials
              </p>
            </div>
            <BrutalButton
              variant="primary"
              onClick={() => navigate('/admin/upload')}
            >
              + Upload New
            </BrutalButton>
          </div>

          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="
                  mb-6 p-4
                  bg-red-100
                  border-2 border-red-500
                  rounded-2xl
                  flex items-center gap-3
                "
              >
                <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-medium text-red-700">{error}</span>
                <button 
                  onClick={fetchContent}
                  className="ml-auto text-red-700 underline hover:no-underline"
                >
                  Retry
                </button>
              </motion.div>
            )}
          </AnimatePresence>

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
                  rounded-2xl
                  shadow-[4px_4px_0px_#111111]
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

          {/* Loading State */}
          {isLoading && (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <SkeletonLoader key={i} height="h-24" />
              ))}
            </div>
          )}

          {/* Content when loaded */}
          {!isLoading && (
            <>
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
            </>
          )}
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
