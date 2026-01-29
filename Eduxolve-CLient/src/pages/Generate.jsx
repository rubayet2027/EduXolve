/**
 * Generate Page - AI Content Generation Interface
 * Create notes, slides, or lab code grounded in course materials
 */

import { useState } from 'react'
import { PromptPanel, OutputPanel } from '../components/generate'
import PageWrapper from '../components/common/PageWrapper'

// Mock generated outputs based on content type
const mockOutputs = {
  notes: {
    title: 'Understanding Stacks: A Complete Guide',
    validationStatus: 'grounded',
    sections: [
      {
        heading: 'What is a Stack?',
        content: 'A stack is a linear data structure that follows the Last-In-First-Out (LIFO) principle. This means the last element added to the stack will be the first one to be removed.',
        bullets: [
          'Elements are added (pushed) to the top',
          'Elements are removed (popped) from the top',
          'Only the top element is accessible at any time',
          'Common analogy: a stack of plates'
        ]
      },
      {
        heading: 'Core Operations',
        bullets: [
          'push(item): Add an element to the top - O(1)',
          'pop(): Remove and return the top element - O(1)',
          'peek()/top(): View the top element without removing - O(1)',
          'isEmpty(): Check if stack is empty - O(1)',
          'size(): Return number of elements - O(1)'
        ]
      },
      {
        heading: 'Real-World Applications',
        content: 'Stacks are used extensively in computer science and software development:',
        bullets: [
          'Undo functionality in text editors',
          'Browser back button navigation',
          'Function call stack in programming',
          'Expression evaluation and parsing',
          'Backtracking algorithms (maze solving, etc.)'
        ],
        note: 'Understanding stacks is fundamental for more advanced topics like recursion and tree traversals.'
      }
    ],
    sources: ['Lecture 3 - Data Structures', 'Course Notes - Chapter 4', 'Lab Manual - Week 3']
  },
  slides: {
    title: 'Stacks: Data Structure Overview',
    validationStatus: 'grounded',
    sections: [
      {
        heading: 'Slide 1: Introduction to Stacks',
        bullets: [
          'Linear data structure',
          'LIFO (Last-In-First-Out) principle',
          'Foundation for many algorithms'
        ]
      },
      {
        heading: 'Slide 2: The LIFO Principle',
        content: 'Think of a stack of plates:',
        bullets: [
          'You add plates to the top',
          'You remove plates from the top',
          'You cannot access plates in the middle'
        ]
      },
      {
        heading: 'Slide 3: Stack Operations',
        bullets: [
          'push(item) → Add to top',
          'pop() → Remove from top',
          'peek() → View top',
          'isEmpty() → Check if empty'
        ],
        note: 'All operations are O(1) - constant time complexity!'
      },
      {
        heading: 'Slide 4: Applications',
        bullets: [
          'Undo/Redo functionality',
          'Browser history',
          'Recursion call stack',
          'Expression evaluation'
        ]
      }
    ],
    sources: ['Lecture 3 - Slides', 'Course Textbook - Chapter 5']
  },
  code: {
    python: {
      title: 'Stack Implementation in Python',
      validationStatus: 'grounded',
      sections: [
        {
          heading: 'Complete Stack Class',
          content: 'Here is a complete implementation of a Stack data structure in Python:',
          code: `class Stack:
    """A Stack implementation using Python list."""
    
    def __init__(self):
        """Initialize an empty stack."""
        self.items = []
    
    def push(self, item):
        """Add an item to the top of the stack."""
        self.items.append(item)
    
    def pop(self):
        """Remove and return the top item."""
        if self.is_empty():
            raise IndexError("Stack is empty")
        return self.items.pop()
    
    def peek(self):
        """Return the top item without removing it."""
        if self.is_empty():
            raise IndexError("Stack is empty")
        return self.items[-1]
    
    def is_empty(self):
        """Check if the stack is empty."""
        return len(self.items) == 0
    
    def size(self):
        """Return the number of items."""
        return len(self.items)`
        },
        {
          heading: 'Usage Example',
          code: `# Create a stack and perform operations
stack = Stack()

# Push elements
stack.push("A")
stack.push("B")
stack.push("C")

print(stack.peek())    # Output: C
print(stack.pop())     # Output: C
print(stack.size())    # Output: 2
print(stack.is_empty()) # Output: False`,
          note: 'This implementation uses Python\'s built-in list which provides O(1) append and pop operations.'
        }
      ],
      sources: ['Lab Sheet 2 - Python Implementation', 'Reference Code Repository']
    },
    cpp: {
      title: 'Stack Implementation in C++',
      validationStatus: 'review',
      sections: [
        {
          heading: 'Stack Class with Templates',
          content: 'A generic Stack implementation using C++ templates:',
          code: `#include <iostream>
#include <vector>
#include <stdexcept>

template <typename T>
class Stack {
private:
    std::vector<T> items;
    
public:
    void push(const T& item) {
        items.push_back(item);
    }
    
    T pop() {
        if (isEmpty()) {
            throw std::runtime_error("Stack is empty");
        }
        T top = items.back();
        items.pop_back();
        return top;
    }
    
    T peek() const {
        if (isEmpty()) {
            throw std::runtime_error("Stack is empty");
        }
        return items.back();
    }
    
    bool isEmpty() const {
        return items.empty();
    }
    
    size_t size() const {
        return items.size();
    }
};`
        },
        {
          heading: 'Usage Example',
          code: `int main() {
    Stack<int> stack;
    
    stack.push(10);
    stack.push(20);
    stack.push(30);
    
    std::cout << stack.peek() << std::endl;  // 30
    std::cout << stack.pop() << std::endl;   // 30
    std::cout << stack.size() << std::endl;  // 2
    
    return 0;
}`,
          note: 'Templates allow the stack to store any data type while maintaining type safety.'
        }
      ],
      sources: ['Lab Sheet 2 - C++ Implementation', 'Course Reference Materials']
    },
    javascript: {
      title: 'Stack Implementation in JavaScript',
      validationStatus: 'grounded',
      sections: [
        {
          heading: 'ES6 Stack Class',
          content: 'Modern JavaScript implementation using ES6 classes:',
          code: `class Stack {
  constructor() {
    this.items = [];
  }
  
  push(item) {
    this.items.push(item);
  }
  
  pop() {
    if (this.isEmpty()) {
      throw new Error("Stack is empty");
    }
    return this.items.pop();
  }
  
  peek() {
    if (this.isEmpty()) {
      throw new Error("Stack is empty");
    }
    return this.items[this.items.length - 1];
  }
  
  isEmpty() {
    return this.items.length === 0;
  }
  
  size() {
    return this.items.length;
  }
  
  clear() {
    this.items = [];
  }
}`
        },
        {
          heading: 'Usage Example',
          code: `const stack = new Stack();

stack.push("first");
stack.push("second");
stack.push("third");

console.log(stack.peek());    // "third"
console.log(stack.pop());     // "third"
console.log(stack.size());    // 2
console.log(stack.isEmpty()); // false`,
          note: 'JavaScript arrays have built-in push() and pop() methods that make stack implementation straightforward.'
        }
      ],
      sources: ['Lab Sheet 2 - JavaScript Examples', 'MDN Web Docs Reference']
    }
  }
}

function Generate() {
  const [prompt, setPrompt] = useState('')
  const [contentType, setContentType] = useState('notes')
  const [language, setLanguage] = useState('python')
  const [isLoading, setIsLoading] = useState(false)
  const [output, setOutput] = useState(null)

  const handleGenerate = async () => {
    setIsLoading(true)
    setOutput(null)

    // Simulate AI generation delay
    await new Promise(resolve => setTimeout(resolve, 1200 + Math.random() * 600))

    // Get mock output based on content type
    let mockOutput
    if (contentType === 'code') {
      mockOutput = mockOutputs.code[language]
    } else {
      mockOutput = mockOutputs[contentType]
    }

    setOutput(mockOutput)
    setIsLoading(false)
  }

  return (
    <PageWrapper>
      <div className="min-h-screen bg-[#FAF8F5] flex flex-col">
        {/* Main Content - Two Column Layout */}
        <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-8">
          {/* Page Title */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-[#111111]">
              Generate Learning Materials
            </h1>
            <p className="text-sm text-[#111111]/60 mt-1">
              Create notes, slides, or lab code using course content
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full min-h-150">
            {/* Left Panel - Prompt & Options */}
            <PromptPanel
              prompt={prompt}
              setPrompt={setPrompt}
              contentType={contentType}
              setContentType={setContentType}
              language={language}
              setLanguage={setLanguage}
              onGenerate={handleGenerate}
              isLoading={isLoading}
            />

            {/* Right Panel - Generated Output */}
            <OutputPanel
              output={output}
              isLoading={isLoading}
              contentType={contentType}
            />
          </div>
        </main>
      </div>
    </PageWrapper>
  )
}

export default Generate
