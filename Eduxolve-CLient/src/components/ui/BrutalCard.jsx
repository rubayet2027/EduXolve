/**
 * BrutalCard - A card component following Soft Neubrutalism design
 * 
 * Features:
 * - Thick black border (2px)
 * - Hard offset shadow (no blur)
 * - Large rounded corners
 * - Flat background color
 * - Optional hover lift effect
 */

function BrutalCard({ 
  children, 
  className = '', 
  hoverable = false,
  ...props 
}) {
  return (
    <div
      className={`
        bg-white
        border-2 border-[#111111]
        rounded-xl
        shadow-[4px_4px_0_#111111]
        p-6
        ${hoverable ? `
          cursor-pointer
          transition-all duration-150 ease-out
          hover:-translate-x-0.5 hover:-translate-y-0.5
          hover:shadow-[6px_6px_0_#111111]
        ` : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  )
}

export default BrutalCard
