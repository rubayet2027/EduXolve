/**
 * Navbar - Global navigation bar for all pages
 * Follows Soft Neubrutalism design
 * Features: Hide on scroll down, show on scroll up, hamburger menu for mobile
 */

import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { IoPerson, IoSearch, IoChatbubbles, IoSparkles, IoHome, IoSettings, IoMenu, IoClose } from 'react-icons/io5'
import { motion, AnimatePresence } from 'framer-motion'
import { BrutalButton } from '../ui'
import { useAuthStore } from '../../store'
import { logout } from '../../services/auth.service'

// Use motion and AnimatePresence for animations
const MotionHeader = motion.header
const MotionDiv = motion.div

function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, role } = useAuthStore()
  const [isVisible, setIsVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const prevPathRef = useRef(location.pathname)

  // Handle scroll to show/hide navbar
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      
      if (currentScrollY < 10) {
        // Always show at top
        setIsVisible(true)
      } else if (currentScrollY > lastScrollY && currentScrollY > 80) {
        // Scrolling down & past threshold - hide
        setIsVisible(false)
        setMobileMenuOpen(false)
      } else if (currentScrollY < lastScrollY) {
        // Scrolling up - show
        setIsVisible(true)
      }
      
      setLastScrollY(currentScrollY)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [lastScrollY])

  // Close mobile menu on route change
  useEffect(() => {
    if (prevPathRef.current !== location.pathname) {
      prevPathRef.current = location.pathname
      // Schedule state update for next tick to avoid cascading renders
      const timer = setTimeout(() => setMobileMenuOpen(false), 0)
      return () => clearTimeout(timer)
    }
  }, [location.pathname])

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  const handleNavClick = (path) => {
    navigate(path)
    setMobileMenuOpen(false)
  }

  // Navigation links for authenticated users
  const navLinks = [
    { path: '/dashboard', label: 'Dashboard', icon: IoHome },
    { path: '/search', label: 'Search', icon: IoSearch },
    { path: '/chat', label: 'Chat', icon: IoChatbubbles },
    { path: '/generate', label: 'Generate', icon: IoSparkles },
  ]

  const isActive = (path) => location.pathname === path

  // Show landing navbar on landing or login pages (before login)
  if (!user || location.pathname === '/' || location.pathname === '/login') {
    return (
      <>
        <MotionHeader 
          className="border-b-2 border-[#111111] bg-white/90 backdrop-blur-sm fixed top-0 left-0 right-0 z-50"
          initial={{ y: 0 }}
          animate={{ y: isVisible ? 0 : -100 }}
          transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
            {/* Left: Logo */}
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 cursor-pointer"
            >
              <div className="w-10 h-10 bg-[#4ECDC4] border-2 border-[#111111] rounded-xl shadow-[2px_2px_0px_#111111] flex items-center justify-center">
                <span className="text-lg font-bold text-[#111111]">E</span>
              </div>
              <span className="text-xl font-bold text-[#111111]">EduXolve</span>
            </button>

            {/* Right: Sign In Button */}
            <BrutalButton 
              variant="primary" 
              onClick={() => navigate('/login')}
              className="px-5 py-2"
            >
              Sign In
            </BrutalButton>
          </div>
        </MotionHeader>
        {/* Spacer for fixed navbar */}
        <div className="h-16" />
      </>
    )
  }

  return (
    <>
      <MotionHeader 
        className="border-b-2 border-[#111111] bg-white fixed top-0 left-0 right-0 z-50"
        initial={{ y: 0 }}
        animate={{ y: isVisible ? 0 : -100 }}
        transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
      >
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
          {/* Left: Logo */}
          <button
            onClick={() => handleNavClick('/dashboard')}
            className="flex items-center gap-2 cursor-pointer"
          >
            <div className="w-10 h-10 bg-[#4ECDC4] border-2 border-[#111111] rounded-xl shadow-[2px_2px_0px_#111111] flex items-center justify-center">
              <span className="text-lg font-bold text-[#111111]">E</span>
            </div>
            <span className="text-xl font-bold text-[#111111] hidden sm:block">EduXolve</span>
          </button>

          {/* Center: Nav Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-1 absolute left-1/2 -translate-x-1/2">
            {navLinks.map((link) => {
              const IconComponent = link.icon
              return (
                <button
                  key={link.path}
                  onClick={() => handleNavClick(link.path)}
                  className={`
                    px-4 py-2
                    text-sm font-bold
                    rounded-lg
                    flex items-center gap-2
                    transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]
                    cursor-pointer
                    ${isActive(link.path)
                      ? 'bg-[#4ECDC4] text-[#111111] border-2 border-[#111111] shadow-[2px_2px_0px_#111111]'
                      : 'text-[#111111]/70 hover:text-[#111111] hover:bg-[#F5F5F5]'
                    }
                  `}
                >
                  <IconComponent size={16} />
                  {link.label}
                </button>
              )
            })}
          </nav>

          {/* Right: Admin, Profile & Logout (Desktop) */}
          <div className="hidden md:flex items-center gap-3">
            {/* Admin Link (if admin) */}
            {role === 'admin' && (
              <button
                onClick={() => handleNavClick('/admin')}
                className={`
                  px-3 py-1.5
                  text-xs font-bold
                  text-[#111111]
                  border-2 border-[#111111]
                  rounded-lg
                  shadow-[2px_2px_0px_#111111]
                  transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]
                  hover:-translate-y-0.5 hover:-translate-x-0.5
                  hover:shadow-[3px_3px_0px_#111111]
                  active:translate-y-0.5 active:translate-x-0.5
                  active:shadow-[0px_0px_0px_#111111]
                  cursor-pointer
                  bg-[#FFF0D9]
                `}
              >
                <IoSettings size={14} className="inline mr-1" />
                Admin
              </button>
            )}

            {/* Profile Avatar */}
            <div className="flex items-center gap-2">
              {user?.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName?.split(' ')[0] || 'Profile'}
                  className="w-9 h-9 border-2 border-[#111111] rounded-full object-cover"
                />
              ) : (
                <div className="w-9 h-9 bg-[#E8E8E4] border-2 border-[#111111] rounded-full flex items-center justify-center">
                  <IoPerson size={18} style={{ color: '#007AFF' }} />
                </div>
              )}
              <span className="text-sm font-medium text-[#111111] hidden lg:block">
                {user?.displayName?.split(' ')[0] || user?.email?.split('@')[0] || 'Student'}
              </span>
            </div>

            {/* Logout Button */}
            <BrutalButton 
              variant="neutral" 
              onClick={handleLogout}
              className="px-3 py-1.5 text-sm"
            >
              Logout
            </BrutalButton>
          </div>

          {/* Hamburger Menu Button (Mobile) */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg border-2 border-[#111111] bg-white shadow-[2px_2px_0px_#111111] cursor-pointer"
          >
            {mobileMenuOpen ? <IoClose size={24} /> : <IoMenu size={24} />}
          </button>
        </div>
      </MotionHeader>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <MotionDiv
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/30 z-40 md:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />

            {/* Mobile Menu Panel */}
            <MotionDiv
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
              className="fixed top-0 right-0 h-full w-72 bg-white border-l-2 border-[#111111] z-50 md:hidden overflow-y-auto"
            >
              {/* Mobile Menu Header */}
              <div className="p-4 border-b-2 border-[#111111]/10 flex items-center justify-between">
                <span className="text-lg font-bold text-[#111111]">Menu</span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-lg hover:bg-[#F5F5F5] cursor-pointer"
                >
                  <IoClose size={24} />
                </button>
              </div>

              {/* User Info */}
              <div className="p-4 border-b-2 border-[#111111]/10">
                <div className="flex items-center gap-3">
                  {user?.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName?.split(' ')[0] || 'Profile'}
                      className="w-12 h-12 border-2 border-[#111111] rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-[#E8E8E4] border-2 border-[#111111] rounded-full flex items-center justify-center">
                      <IoPerson size={24} style={{ color: '#007AFF' }} />
                    </div>
                  )}
                  <div>
                    <p className="font-bold text-[#111111]">
                      {user?.displayName?.split(' ')[0] || 'Student'}
                    </p>
                    <p className="text-sm text-[#111111]/60">
                      {user?.email}
                    </p>
                  </div>
                </div>
              </div>

              {/* Nav Links */}
              <nav className="p-4 space-y-2">
                {navLinks.map((link) => {
                  const IconComponent = link.icon
                  return (
                    <button
                      key={link.path}
                      onClick={() => handleNavClick(link.path)}
                      className={`
                        w-full px-4 py-3
                        text-left font-bold
                        rounded-xl
                        flex items-center gap-3
                        transition-all duration-200
                        cursor-pointer
                        ${isActive(link.path)
                          ? 'bg-[#4ECDC4] text-[#111111] border-2 border-[#111111] shadow-[2px_2px_0px_#111111]'
                          : 'text-[#111111]/70 hover:text-[#111111] hover:bg-[#F5F5F5]'
                        }
                      `}
                    >
                      <IconComponent size={20} />
                      {link.label}
                    </button>
                  )
                })}

                {/* Admin Link (if admin) */}
                {role === 'admin' && (
                  <button
                    onClick={() => handleNavClick('/admin')}
                    className={`
                      w-full px-4 py-3
                      text-left font-bold
                      rounded-xl
                      flex items-center gap-3
                      transition-all duration-200
                      cursor-pointer
                      ${isActive('/admin')
                        ? 'bg-[#FFF0D9] text-[#111111] border-2 border-[#111111] shadow-[2px_2px_0px_#111111]'
                        : 'text-[#111111]/70 hover:text-[#111111] hover:bg-[#FFF0D9]/50'
                      }
                    `}
                  >
                    <IoSettings size={20} />
                    Admin Dashboard
                  </button>
                )}
              </nav>

              {/* Logout Button */}
              <div className="p-4 mt-auto border-t-2 border-[#111111]/10">
                <BrutalButton 
                  variant="neutral" 
                  onClick={handleLogout}
                  className="w-full justify-center"
                >
                  Logout
                </BrutalButton>
              </div>
            </MotionDiv>
          </>
        )}
      </AnimatePresence>

      {/* Spacer for fixed navbar */}
      <div className="h-16" />
    </>
  )
}

export default Navbar
