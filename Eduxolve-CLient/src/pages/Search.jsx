/**
 * Search Page - Intelligent semantic search over course materials
 */

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BrutalButton } from '../components/ui'
import { SearchBar, SearchResultCard, SearchSkeleton } from '../components/search'
import PageWrapper from '../components/common/PageWrapper'

// Mock search results data
const mockResults = [
  {
    id: 1,
    type: 'theory',
    title: 'Stacks – Lecture Slides (Week 3)',
    snippet: 'A stack is a linear data structure that follows the Last-In-First-Out (LIFO) principle. Elements are added and removed from the same end, called the "top" of the stack. This makes stacks ideal for scenarios requiring reverse-order processing.',
    source: 'Lecture 3 - Data Structures.pdf'
  },
  {
    id: 2,
    type: 'code',
    title: 'Stack Implementation in Python',
    snippet: 'Complete implementation of a Stack class with push, pop, peek, and isEmpty operations. This implementation uses a Python list as the underlying data structure.',
    code: `class Stack:
    def __init__(self):
        self.items = []
    
    def push(self, item):
        self.items.append(item)
    
    def pop(self):
        return self.items.pop()`,
    source: 'Lab Sheet 2 - stack_impl.py'
  },
  {
    id: 3,
    type: 'slide',
    title: 'Stack Operations & Time Complexity',
    snippet: 'All fundamental stack operations (push, pop, peek, isEmpty) have O(1) time complexity. This constant time performance makes stacks highly efficient for applications like expression evaluation and backtracking algorithms.',
    source: 'Lecture 3 - Slide 15'
  },
  {
    id: 4,
    type: 'lab',
    title: 'Lab Exercise: Balanced Parentheses',
    snippet: 'Use a stack to check if parentheses in an expression are balanced. For each opening bracket, push to stack. For each closing bracket, check if it matches the top element and pop. Expression is balanced if stack is empty at the end.',
    source: 'Lab 2 - Exercises.pdf'
  },
  {
    id: 5,
    type: 'note',
    title: 'Common Stack Applications',
    snippet: 'Real-world applications include: Browser back button (history), Undo functionality in text editors, Function call stack in programming languages, Expression evaluation (infix to postfix), and Depth-First Search in graphs.',
    source: 'Course Notes - Chapter 4'
  }
]

function Search() {
  const navigate = useNavigate()
  const [results, setResults] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

  const handleSearch = async (query) => {
    setIsLoading(true)
    setHasSearched(true)
    setResults([])

    // Simulate search delay
    await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 400))

    // Return mock results
    setResults(mockResults)
    setIsLoading(false)
  }

  return (
    <PageWrapper>
      <div className="min-h-screen bg-[#FAFAF7]">
        {/* Header */}
        <header className="border-b-2 border-[#111111] bg-white">
          <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-4">
            {/* Back Button */}
            <BrutalButton
              variant="neutral"
              onClick={() => navigate('/dashboard')}
              className="px-3 py-2"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
            </BrutalButton>

            {/* Title */}
            <div>
              <h1 className="text-xl font-bold text-[#111111]">
                Search Course Materials
              </h1>
              <p className="text-sm text-[#111111]/60">
                Find slides, PDFs, and lab code using natural language
              </p>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-4xl mx-auto px-6 py-10">
          {/* Search Bar Section */}
          <section className="mb-10">
            <SearchBar onSearch={handleSearch} isLoading={isLoading} />
          </section>

          {/* Results Section */}
          <section>
            {/* Loading State */}
            {isLoading && (
              <div className="space-y-4">
                <p className="text-sm text-[#111111]/60 mb-4">Searching course materials...</p>
                <SearchSkeleton />
                <SearchSkeleton />
                <SearchSkeleton />
              </div>
            )}

            {/* Results */}
            {!isLoading && results.length > 0 && (
              <>
                <p className="text-sm text-[#111111]/60 mb-4">
                  Found {results.length} results
                </p>
                <div className="space-y-4">
                  {results.map((result, index) => (
                    <SearchResultCard
                      key={result.id}
                      result={result}
                      index={index}
                    />
                  ))}
                </div>
              </>
            )}

            {/* No Results State */}
            {!isLoading && hasSearched && results.length === 0 && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-[#E8E8E4] border-2 border-[#111111] rounded-xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">🔍</span>
                </div>
                <h3 className="text-lg font-bold text-[#111111] mb-2">
                  No results found
                </h3>
                <p className="text-[#111111]/60">
                  Try different keywords or check your spelling
                </p>
              </div>
            )}

            {/* Initial State */}
            {!isLoading && !hasSearched && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-[#FFD93D] border-2 border-[#111111] rounded-xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">💡</span>
                </div>
                <h3 className="text-lg font-bold text-[#111111] mb-2">
                  Search your course materials
                </h3>
                <p className="text-[#111111]/60 max-w-md mx-auto">
                  Type a question or topic to find relevant lectures, labs, and code examples from your course.
                </p>

                {/* Example Searches */}
                <div className="mt-6">
                  <p className="text-sm text-[#111111]/50 mb-3">Try searching for:</p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {[
                      'How do stacks work?',
                      'Binary tree traversal',
                      'Time complexity examples'
                    ].map((example) => (
                      <button
                        key={example}
                        onClick={() => handleSearch(example)}
                        className="
                          px-4 py-2
                          text-sm
                          bg-white
                          text-[#111111]
                          border-2 border-[#111111]
                          rounded-lg
                          shadow-[2px_2px_0_#111111]
                          hover:-translate-x-0.5 hover:-translate-y-0.5
                          hover:shadow-[3px_3px_0_#111111]
                          active:translate-x-0 active:translate-y-0
                          active:shadow-none
                          transition-all duration-150
                          cursor-pointer
                        "
                      >
                        {example}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </section>
        </main>

        {/* Footer */}
        <footer className="border-t-2 border-[#111111] mt-auto">
          <div className="max-w-4xl mx-auto px-6 py-4 text-center">
            <p className="text-sm text-[#111111]/50">
              Powered by semantic search over your course materials
            </p>
          </div>
        </footer>
      </div>
    </PageWrapper>
  )
}

export default Search
