/**
 * SectionHeader - A reusable section header component
 */

function SectionHeader({ title, subtitle }) {
  return (
    <div className="mb-6">
      <h2 className="text-2xl font-bold text-[#111111]">
        {title}
      </h2>
      {subtitle && (
        <p className="text-[#111111]/60 mt-1">
          {subtitle}
        </p>
      )}
    </div>
  )
}

export default SectionHeader
