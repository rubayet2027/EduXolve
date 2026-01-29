/**
 * ActionButtons - Reusable action buttons for AI messages
 */

import { BrutalButton } from '../ui'

function ActionButtons({ actions, onAction }) {
  return (
    <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t-2 border-[#111111]/20">
      {actions.map((action, index) => (
        <BrutalButton
          key={index}
          variant="neutral"
          onClick={() => onAction(action)}
          className="px-3 py-1.5 text-sm bg-white"
        >
          {action}
        </BrutalButton>
      ))}
    </div>
  )
}

export default ActionButtons
