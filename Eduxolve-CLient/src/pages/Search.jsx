/**
 * Search Page - Intelligent semantic search over course materials
 */

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { IoSearch, IoInformationCircle, IoWarning } from 'react-icons/io5'
import { BrutalButton } from '../components/ui'
import { SearchBar, SearchResultCard, SearchSkeleton } from '../components/search'
import PageWrapper from '../components/common/PageWrapper'
import { searchApi } from '../services/api'

function Search() {
  const navigate = useNavigate()
  const [results, setResults] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearch = async (query) => {
    if (!query.trim()) return
    
    setIsLoading(true)
    setHasSearched(true)
    setResults([])
    setError(null)
    setSearchQuery(query)

    try {
      // Call the search API
      const response = await searchApi.search({
        query,
        limit: 10
      })

      // Extract results from response
      const searchResults = response.data?.results || response.results || response.data || []
      
      // Map results to expected format
      const mappedResults = searchResults.map((item, index) => ({
        id: item._id || item.id || index,
        type: item.type || 'theory',
        title: item.title || item.contentTitle || 'Untitled',
        snippet: item.text || item.snippet || item.content || '',
        source: item.source || item.sourceName || item.filename || 'Course Materials',
        code: item.code || null,
        score: item.score || item.similarity || null,
        contentId: item.contentId || null
      }))

      setResults(mappedResults)
    } catch (err) {
      console.error('Search error:', err)
      setError(err.message || 'Search failed. Please try again.')
      setResults([])
    } finally {
      setIsLoading(false)
    }
  }

  // Handle "Ask AI" action from search result
  const handleAskAI = (result) => {
    // Navigate to chat with context
    navigate('/chat', { 
      state: { 
        initialMessage: `Tell me more about: ${result.title}`,
        context: result.snippet 
      } 
    })
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
            {/* Error State */}
            {error && (
              <div className="mb-6 p-4 bg-red-100 border-2 border-red-500 rounded-xl flex items-center gap-3">
                <IoWarning size={24} className="text-red-500 flex-shrink-0" />
                <div>
                  <p className="font-medium text-red-700">{error}</p>
                  <p className="text-sm text-red-600">Please check your connection and try again.</p>
                </div>
              </div>
            )}

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
            {!isLoading && !error && results.length > 0 && (
              <>
                <p className="text-sm text-[#111111]/60 mb-5">
                  Found {results.length} results for "{searchQuery}"
                </p>
                <div className="space-y-5">
                  {results.map((result, index) => (
                    <SearchResultCard
                      key={result.id}
                      result={result}
                      index={index}
                      onAskAI={() => handleAskAI(result)}
                    />
                  ))}
                </div>
              </>
            )}

            {/* No Results State */}
            {!isLoading && !error && hasSearched && results.length === 0 && (
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
