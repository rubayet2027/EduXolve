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
    primary: 'bg-[#FFD93D]',
    secondary: 'bg-[#6BCB77]',
    neutral: 'bg-white',
    danger: 'bg-[#FF6B6B]',
  }

  return (
    <button
      className={`
        px-6 py-3
        font-bold
        text-[#111111]
        border-2 border-[#111111]
        rounded-xl
        shadow-[3px_3px_0px_#111111]
        transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]
        hover:-translate-y-0.5 hover:-translate-x-0.5
        hover:shadow-[4px_4px_0px_#111111]
        active:translate-y-0.5 active:translate-x-0.5
        active:shadow-[0px_0px_0px_#111111]
        disabled:opacity-50 disabled:cursor-not-allowed
        disabled:hover:translate-y-0 disabled:hover:translate-x-0
        disabled:hover:shadow-[3px_3px_0px_#111111]
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
