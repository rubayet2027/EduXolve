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
          placeholder-gray-400
          border-2 border-[#111111]
          rounded-xl
          shadow-[4px_4px_0_#111111]
          outline-none
          transition-all duration-150 ease-in-out
          focus:-translate-x-0.5 focus:-translate-y-0.5
          focus:shadow-[6px_6px_0_#111111]
          ${className}
        `}
        {...props}
      />
    </div>
  )
}

export default BrutalInput
