/**
 * ContentCard - Display card for content items in manage view
 * 
 * Shows:
 * - Title
 * - Type badge (Theory/Lab)
 * - Week
 * - Topic
 * - Action buttons
 */

import BrutalButton from '../ui/BrutalButton'

function ContentCard({ content, onEdit, onDelete }) {
  const typeColors = {
    theory: 'bg-[#FFD93D]',
    lab: 'bg-[#6BCB77]',
  }

  return (
    <div
      className="
        bg-white
        border-2 border-[#111111]
        rounded-xl
        shadow-[4px_4px_0_#111111]
        p-5
        flex flex-col sm:flex-row sm:items-center
        gap-4
      "
    >
      {/* Content Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 mb-2">
          <h3 className="font-bold text-[#111111] truncate">
            {content.title}
          </h3>
          <span
            className={`
              px-2 py-0.5
              text-xs font-semibold uppercase
              border border-[#111111]
              rounded-md
              shrink-0
              ${typeColors[content.type] || 'bg-gray-100'}
            `}
          >
            {content.type}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-[#111111]/70">
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Week {content.week}
          </span>
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            {content.topic}
          </span>
        </div>
        {content.tags && content.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {content.tags.map((tag) => (
              <span
                key={tag}
                className="
                  px-2 py-0.5
                  text-xs
                  bg-[#FAFAF7]
                  border border-[#111111]/20
                  rounded
                "
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2 shrink-0">
        <BrutalButton
          variant="neutral"
          className="px-4 py-2 text-sm"
          onClick={() => onEdit?.(content)}
        >
          Edit
        </BrutalButton>
        <button
          className="
            px-4 py-2
            text-sm font-semibold
            text-[#111111]
            bg-[#FF6B6B]
            border-2 border-[#111111]
            rounded-xl
            shadow-[4px_4px_0_#111111]
            transition-all duration-150
            hover:-translate-x-0.5 hover:-translate-y-0.5
            hover:shadow-[6px_6px_0_#111111]
            active:translate-x-0.5 active:translate-y-0.5
            active:shadow-none
            cursor-pointer
          "
          onClick={() => onDelete?.(content)}
        >
          Delete
        </button>
      </div>
    </div>
  )
}

export default ContentCard
