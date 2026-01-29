/**
 * ChatHeader - Header component for the chat page
 */

function ChatHeader() {
  return (
    <div className="px-6 py-4 bg-[#FAF8F5]">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-[#111111]">
          Course Assistant
        </h1>
        <p className="text-sm text-[#111111]/60 mt-1">
          Ask questions about your course
        </p>
      </div>
    </div>
  )
}

export default ChatHeader
