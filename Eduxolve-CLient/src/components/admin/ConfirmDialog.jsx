/**
 * ConfirmDialog - Modal confirmation dialog
 * 
 * Used for:
 * - Delete confirmations
 * - Edit confirmations
 */

import BrutalButton from '../ui/BrutalButton'

function ConfirmDialog({ isOpen, title, message, onConfirm, onCancel, confirmText = 'Confirm', confirmVariant = 'primary' }) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-[#111111]/50"
        onClick={onCancel}
      />
      
      {/* Dialog */}
      <div
        className="
          relative
          bg-white
          border-2 border-[#111111]
          rounded-xl
          shadow-[8px_8px_0_#111111]
          p-6
          mx-4
          max-w-md
          w-full
        "
      >
        <h3 className="font-bold text-xl text-[#111111] mb-2">
          {title}
        </h3>
        <p className="text-[#111111]/70 mb-6">
          {message}
        </p>
        
        <div className="flex justify-end gap-3">
          <BrutalButton
            variant="neutral"
            onClick={onCancel}
          >
            Cancel
          </BrutalButton>
          <button
            className={`
              px-6 py-3
              font-semibold
              text-[#111111]
              border-2 border-[#111111]
              rounded-xl
              shadow-[4px_4px_0_#111111]
              transition-all duration-150
              hover:-translate-x-0.5 hover:-translate-y-0.5
              hover:shadow-[6px_6px_0_#111111]
              active:translate-x-0.5 active:translate-y-0.5
              active:shadow-none
              cursor-pointer
              ${confirmVariant === 'danger' ? 'bg-[#FF6B6B] hover:bg-[#FF8585]' : 'bg-[#FFD93D] hover:bg-[#FFE566]'}
            `}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmDialog
