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
        rounded-2xl
        shadow-[3px_3px_0px_#111111]
        p-6
        ${hoverable ? `
          cursor-pointer
          transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]
          hover:-translate-y-0.5 hover:-translate-x-0.5
          hover:shadow-[4px_4px_0px_#111111]
          active:translate-y-0.5 active:translate-x-0.5
          active:shadow-[0px_0px_0px_#111111]
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
