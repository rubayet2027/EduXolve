/**
 * API Client Service
 * 
 * Centralized API client with:
 * - Automatic Firebase ID token attachment
 * - Global error handling
 * - Loading state management
 * - Response normalization
 */

import { auth } from './firebase'

// API Base URL from environment
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'

/**
 * Custom API Error class
 */
export class ApiError extends Error {
  constructor(message, status, data = null) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.data = data
  }
}

/**
 * Get the current user's Firebase ID token
 * @returns {Promise<string|null>} ID token or null if not authenticated
 */
export const getAuthToken = async () => {
  const user = auth.currentUser
  if (!user) return null
  
  try {
    const token = await user.getIdToken()
    return token
  } catch (error) {
    console.error('Failed to get auth token:', error)
    return null
  }
}

/**
 * Build request headers with auth token
 * @param {boolean} includeAuth - Whether to include auth token
 * @param {boolean} isFormData - Whether request body is FormData
 * @returns {Promise<Headers>}
 */
const buildHeaders = async (includeAuth = true, isFormData = false) => {
  const headers = {}
  
  // Don't set Content-Type for FormData (browser sets it with boundary)
  if (!isFormData) {
    headers['Content-Type'] = 'application/json'
  }
  
  if (includeAuth) {
    const token = await getAuthToken()
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
  }
  
  return headers
}

/**
 * Handle API response
 * @param {Response} response - Fetch response object
 * @returns {Promise<any>} Parsed response data
 * @throws {ApiError} On error responses
 */
const handleResponse = async (response) => {
  let data
  
  try {
    data = await response.json()
  } catch {
    // Response is not JSON
    if (!response.ok) {
      throw new ApiError(
        'An unexpected error occurred',
        response.status
      )
    }
    return null
  }
  
  if (!response.ok) {
    throw new ApiError(
      data.message || 'An error occurred',
      response.status,
      data
    )
  }
  
  return data
}

/**
 * Global error handler for API errors
 * @param {ApiError} error - The API error
 * @returns {never} Throws the error after handling
 */
const handleApiError = (error) => {
  // Handle specific status codes
  if (error.status === 401) {
    // Unauthorized - token expired or invalid
    console.warn('Unauthorized request - redirecting to login')
    // Dispatch custom event for auth handling
    window.dispatchEvent(new CustomEvent('auth:unauthorized'))
  } else if (error.status === 403) {
    // Forbidden - user doesn't have permission
    console.warn('Forbidden - insufficient permissions')
    window.dispatchEvent(new CustomEvent('auth:forbidden'))
  }
  
  throw error
}

/**
 * Make an API request
 * @param {string} endpoint - API endpoint (without base URL)
 * @param {Object} options - Request options
 * @returns {Promise<any>} Response data
 */
const request = async (endpoint, options = {}) => {
  const {
    method = 'GET',
    body = null,
    includeAuth = true,
    isFormData = false,
  } = options
  
  const url = `${API_BASE_URL}${endpoint}`
  const headers = await buildHeaders(includeAuth, isFormData)
  
  const config = {
    method,
    headers,
  }
  
  if (body) {
    config.body = isFormData ? body : JSON.stringify(body)
  }
  
  try {
    const response = await fetch(url, config)
    return await handleResponse(response)
  } catch (error) {
    if (error instanceof ApiError) {
      handleApiError(error)
    }
    
    // Network error or other fetch error
    console.error('API Request failed:', error)
    throw new ApiError(
      'Network error. Please check your connection.',
      0
    )
  }
}

// ===================
// API Methods
// ===================

/**
 * AUTH / USER
 */
export const userApi = {
  /**
   * Get current user info from backend (source of truth for role)
   */
  getMe: () => request('/me'),
  
  /**
   * Get full user profile
   */
  getProfile: () => request('/me/full'),
}

/**
 * CONTENT / CMS
 */
export const contentApi = {
  /**
   * List all content with optional filters
   * @param {Object} filters - { type, week, topic, tags, page, limit }
   */
  list: (filters = {}) => {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value)
      }
    })
    const query = params.toString()
    return request(`/content${query ? `?${query}` : ''}`)
  },
  
  /**
   * Get single content by ID
   * @param {string} id - Content ID
   */
  get: (id) => request(`/content/${id}`),
  
  /**
   * Upload new content (Admin only)
   * @param {FormData} formData - File + metadata
   */
  upload: (formData) => request('/content', {
    method: 'POST',
    body: formData,
    isFormData: true,
  }),
  
  /**
   * Update content metadata (Admin only)
   * @param {string} id - Content ID
   * @param {Object} updates - Fields to update
   */
  update: (id, updates) => request(`/content/${id}`, {
    method: 'PATCH',
    body: updates,
  }),
  
  /**
   * Delete content (Admin only)
   * @param {string} id - Content ID
   */
  delete: (id) => request(`/content/${id}`, {
    method: 'DELETE',
  }),
}

/**
 * SEARCH
 */
export const searchApi = {
  /**
   * Semantic search for content
   * @param {Object} params - { query, type, week, topic, limit }
   */
  search: (params) => request('/search', {
    method: 'POST',
    body: params,
  }),
  
  /**
   * Get search suggestions
   * @param {string} query - Partial query string
   */
  suggestions: (query) => request(`/search/suggestions?q=${encodeURIComponent(query)}`),
  
  /**
   * Get related content
   * @param {string} contentId - Content ID
   */
  related: (contentId) => request(`/search/related/${contentId}`),
  
  /**
   * Get RAG context for a topic
   * @param {Object} params - { topic, type, maxChunks }
   */
  getContext: (params) => request('/search/context', {
    method: 'POST',
    body: params,
  }),
}

/**
 * AI GENERATION
 */
export const aiApi = {
  /**
   * Get AI service info (supported types, languages)
   */
  getInfo: () => request('/ai/info'),
  
  /**
   * Generate content
   * @param {Object} params - { type, topic, language, context, options }
   */
  generate: (params) => request('/ai/generate', {
    method: 'POST',
    body: params,
  }),
  
  /**
   * Quick theory generation
   * @param {Object} params - { topic, context, options }
   */
  generateTheory: (params) => request('/ai/theory', {
    method: 'POST',
    body: params,
  }),
  
  /**
   * Quick lab code generation
   * @param {Object} params - { topic, language, context, options }
   */
  generateLab: (params) => request('/ai/lab', {
    method: 'POST',
    body: params,
  }),
  
  /**
   * Quick slides generation
   * @param {Object} params - { topic, context, options }
   */
  generateSlides: (params) => request('/ai/slides', {
    method: 'POST',
    body: params,
  }),
}

/**
 * VALIDATION
 */
export const validationApi = {
  /**
   * Full validation with all layers
   * @param {Object} params - { type, content, context, options }
   */
  validate: (params) => request('/validate', {
    method: 'POST',
    body: params,
  }),
  
  /**
   * Quick validation without AI evaluation
   * @param {Object} params - { type, content }
   */
  quickValidate: (params) => request('/validate/quick', {
    method: 'POST',
    body: params,
  }),
  
  /**
   * Check content correctness
   * @param {Object} params - { content, topic }
   */
  checkCorrectness: (params) => request('/validate/correctness', {
    method: 'POST',
    body: params,
  }),
}

/**
 * CHAT
 */
export const chatApi = {
  /**
   * Send a chat message
   * @param {Object} params - { message, history, fileId }
   */
  send: (params) => request('/chat', {
    method: 'POST',
    body: params,
  }),
  
  /**
   * Clear chat session
   */
  clearSession: () => request('/chat/clear', {
    method: 'POST',
  }),
  
  /**
   * Get chat history
   */
  getHistory: () => request('/chat/history'),
  
  /**
   * Execute a quick action
   * @param {Object} params - { action, context }
   */
  executeAction: (params) => request('/chat/action', {
    method: 'POST',
    body: params,
  }),
}

/**
 * FILE UPLOAD
 */
export const fileApi = {
  /**
   * Upload a file for AI processing
   * @param {File} file - File to upload
   * @param {Function} onProgress - Progress callback (0-100)
   * @returns {Promise<Object>} Upload result with fileId
   */
  upload: async (file, onProgress = null) => {
    const formData = new FormData()
    formData.append('file', file)
    
    // Use XMLHttpRequest for progress tracking
    if (onProgress) {
      // Get token before Promise to avoid async executor anti-pattern
      const token = await getAuthToken()
      
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest()
        
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const progress = Math.round((e.loaded / e.total) * 100)
            onProgress(progress)
          }
        })
        
        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const data = JSON.parse(xhr.responseText)
              resolve(data)
            } catch {
              reject(new ApiError('Invalid response', xhr.status))
            }
          } else {
            try {
              const data = JSON.parse(xhr.responseText)
              reject(new ApiError(data.message || 'Upload failed', xhr.status, data))
            } catch {
              reject(new ApiError('Upload failed', xhr.status))
            }
          }
        })
        
        xhr.addEventListener('error', () => {
          reject(new ApiError('Network error during upload', 0))
        })
        
        xhr.open('POST', `${API_BASE_URL}/files/upload`)
        if (token) {
          xhr.setRequestHeader('Authorization', `Bearer ${token}`)
        }
        xhr.send(formData)
      })
    }
    
    // Standard fetch without progress
    return request('/files/upload', {
      method: 'POST',
      body: formData,
      isFormData: true,
    })
  },
  
  /**
   * Get file context by ID
   * @param {string} fileId - File ID
   */
  getContext: (fileId) => request(`/files/${fileId}/context`),
  
  /**
   * Delete file context
   * @param {string} fileId - File ID
   */
  delete: (fileId) => request(`/files/${fileId}`, {
    method: 'DELETE',
  }),
  
  /**
   * Get supported file types
   */
  getSupportedTypes: () => request('/files/supported-types', {
    includeAuth: false,
  }),
}

// Default export with all APIs
const api = {
  user: userApi,
  content: contentApi,
  search: searchApi,
  ai: aiApi,
  validation: validationApi,
  chat: chatApi,
  file: fileApi,
}

export default api
