/**
 * BrutalButton - A button component following Soft Neubrutalism design
 * 
 * Features:
 * - Thick black border (2px)
 * - Hard offset shadow (no blur)
 * - Large rounded corners
 * - Hover: lifts up (-2px, -2px)
 * - Press: pushes down (2px, 2px), shadow removed
 */

function BrutalButton({ 
  children, 
  className = '', 
  variant = 'primary',
  ...props 
}) {
  const variants = {
    primary: 'bg-[#FFD93D] hover:bg-[#FFE566]',
    secondary: 'bg-[#6BCB77] hover:bg-[#7DD889]',
    neutral: 'bg-white hover:bg-gray-50',
  }

  return (
    <button
      className={`
        px-6 py-3
        font-semibold
        text-[#111111]
        border-2 border-[#111111]
        rounded-xl
        shadow-[4px_4px_0_#111111]
        transition-all duration-150 ease-in-out
        hover:-translate-x-0.5 hover:-translate-y-0.5
        hover:shadow-[6px_6px_0_#111111]
        active:translate-x-0.5 active:translate-y-0.5
        active:shadow-none
        cursor-pointer
        ${variants[variant] || variants.primary}
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  )
}

export default BrutalButton
