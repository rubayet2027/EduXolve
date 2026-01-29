/**
 * Search Page - Intelligent semantic search over course materials
 */

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { IoSearch, IoInformationCircle } from 'react-icons/io5'
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
      <div className="min-h-screen bg-[#FAF8F5]">
        {/* Main Content */}
        <main className="max-w-4xl mx-auto px-6 py-12">
          {/* Page Title */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-[#111111]">
              Search Course Materials
            </h1>
            <p className="text-sm text-[#111111]/60 mt-1">
              Find slides, PDFs, and lab code using natural language
            </p>
          </div>

          {/* Search Bar Section */}
          <section className="mb-12">
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
                <p className="text-sm text-[#111111]/60 mb-5">
                  Found {results.length} results
                </p>
                <div className="space-y-5">
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
                  <IoSearch size={28} style={{ color: '#8E8E93' }} />
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
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-[#FFF0D9] border-2 border-[#111111] rounded-xl shadow-[2px_2px_0px_#111111] flex items-center justify-center mx-auto mb-5">
                  <IoInformationCircle size={28} style={{ color: '#FF9500' }} />
                </div>
                <h3 className="text-lg font-bold text-[#111111] mb-2">
                  Search your course materials
                </h3>
                <p className="text-[#111111]/60 max-w-md mx-auto">
                  Type a question or topic to find relevant lectures, labs, and code examples from your course.
                </p>

                {/* Example Searches */}
                <div className="mt-8">
                  <p className="text-sm text-[#111111]/50 mb-4">Try searching for:</p>
                  <div className="flex flex-wrap gap-3 justify-center">
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
                          bg-[#E8F0FC]
                          text-[#111111]
                          border-2 border-[#111111]
                          rounded-lg
                          shadow-[2px_2px_0px_#111111]
                          hover:-translate-y-0.5 hover:-translate-x-0.5
                          hover:shadow-[3px_3px_0px_#111111]
                          active:translate-y-0 active:translate-x-0
                          active:shadow-[0px_0px_0px_#111111]
                          transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]
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
      </div>
    </PageWrapper>
  )
}

export default Search
