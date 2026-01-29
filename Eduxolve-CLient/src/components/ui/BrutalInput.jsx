/**
 * BrutalInput - An input component following Soft Neubrutalism design
 * 
 * Features:
 * - Thick black border (2px)
 * - Hard offset shadow (no blur)
 * - Large rounded corners
 * - Clean focus state
 */

function BrutalInput({ 
  className = '', 
  label,
  id,
  ...props 
}) {
  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label 
          htmlFor={id}
          className="font-semibold text-[#111111]"
        >
          {label}
        </label>
      )}
      <input
        id={id}
        className={`
          px-4 py-3
          bg-white
          text-[#111111]
          placeholder-[#111111]/40
          border-2 border-[#111111]
          rounded-xl
          shadow-[2px_2px_0px_#111111]
          outline-none
          transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]
          focus:-translate-y-0.5 focus:-translate-x-0.5
          focus:shadow-[3px_3px_0px_#111111]
          focus:border-[#111111]
          ${className}
        `}
        {...props}
      />
    </div>
  )
}

export default BrutalInput
