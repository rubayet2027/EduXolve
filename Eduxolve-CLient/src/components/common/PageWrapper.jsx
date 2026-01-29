/**
 * PageWrapper - Provides consistent page transitions, global navbar and footer
 * 
 * Wraps pages with subtle enter/exit animations:
 * - Fade in/out
 * - Slight vertical slide
 * - Short duration (200ms)
 * - Global navbar on authenticated pages
 * - Global footer on all pages
 */

import { motion } from 'framer-motion'
import Footer from './Footer'
import Navbar from './Navbar'

const pageVariants = {
  initial: {
    opacity: 0,
    y: 8,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.22,
      ease: [0.16, 1, 0.3, 1],
    },
  },
  exit: {
    opacity: 0,
    y: -6,
    transition: {
      duration: 0.18,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
}

function PageWrapper({ children, className = '', showFooter = true, showNavbar = true }) {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className={`min-h-screen flex flex-col ${className}`}
    >
      {showNavbar && <Navbar />}
      <div className="flex-1">
        {children}
      </div>
      {showFooter && <Footer />}
    </motion.div>
  )
}

export default PageWrapper
