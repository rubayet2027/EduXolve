/**
 * MetadataForm - Form for content metadata
 * 
 * Fields:
 * - Content Type (Theory/Lab)
 * - Week number
 * - Topic
 * - Tags (comma-separated)
 */

import { useState } from 'react'
import BrutalInput from '../ui/BrutalInput'
import BrutalButton from '../ui/BrutalButton'

function MetadataForm({ onSubmit, isSubmitting }) {
  const [formData, setFormData] = useState({
    contentType: 'theory',
    week: '',
    topic: '',
    tags: '',
  })

  const handleChange = (field) => (e) => {
    setFormData((prev) => ({
      ...prev,
      [field]: e.target.value,
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit?.(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Content Type */}
      <div className="flex flex-col gap-2">
        <label className="font-bold text-[#111111]">
          Content Type
        </label>
        <div className="flex gap-4">
          <label
            className={`
              flex items-center gap-3 px-4 py-3
              border-2 border-[#111111] rounded-2xl
              cursor-pointer transition-all duration-150 ease-out
              ${formData.contentType === 'theory' 
                ? 'bg-[#FFD93D] shadow-[4px_4px_0px_#111111]' 
                : 'bg-white shadow-[2px_2px_0px_#111111] hover:-translate-y-0.5 hover:-translate-x-0.5 hover:shadow-[3px_3px_0px_#111111]'}
            `}
          >
            <input
              type="radio"
              name="contentType"
              value="theory"
              checked={formData.contentType === 'theory'}
              onChange={handleChange('contentType')}
              className="w-4 h-4 accent-[#111111]"
            />
            <span className="font-bold">Theory</span>
          </label>
          <label
            className={`
              flex items-center gap-3 px-4 py-3
              border-2 border-[#111111] rounded-2xl
              cursor-pointer transition-all duration-150 ease-out
              ${formData.contentType === 'lab' 
                ? 'bg-[#6BCB77] shadow-[4px_4px_0px_#111111]' 
                : 'bg-white shadow-[2px_2px_0px_#111111] hover:-translate-y-0.5 hover:-translate-x-0.5 hover:shadow-[3px_3px_0px_#111111]'}
            `}
          >
            <input
              type="radio"
              name="contentType"
              value="lab"
              checked={formData.contentType === 'lab'}
              onChange={handleChange('contentType')}
              className="w-4 h-4 accent-[#111111]"
            />
            <span className="font-bold">Lab</span>
          </label>
        </div>
      </div>

      {/* Week Number */}
      <BrutalInput
        id="week"
        label="Week"
        type="number"
        min="1"
        max="16"
        placeholder="e.g., 5"
        value={formData.week}
        onChange={handleChange('week')}
      />

      {/* Topic */}
      <BrutalInput
        id="topic"
        label="Topic"
        type="text"
        placeholder="e.g., Binary Search Trees"
        value={formData.topic}
        onChange={handleChange('topic')}
      />

      {/* Tags */}
      <BrutalInput
        id="tags"
        label="Tags (comma-separated)"
        type="text"
        placeholder="e.g., algorithms, trees, searching"
        value={formData.tags}
        onChange={handleChange('tags')}
      />

      {/* Submit Button */}
      <div className="pt-4">
        <BrutalButton
          type="submit"
          variant="secondary"
          className="w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Saving...' : 'Save & Index'}
        </BrutalButton>
      </div>
    </form>
  )
}

export default MetadataForm
