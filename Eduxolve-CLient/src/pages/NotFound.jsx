/**
 * NotFound - 404 Error Page
 * Shown when user navigates to an undefined route
 */

import { useNavigate } from 'react-router-dom'
import { IoHomeOutline, IoArrowBack } from 'react-icons/io5'
import { BrutalButton } from '../components/ui'
import PageWrapper from '../components/common/PageWrapper'

function NotFound() {
  const navigate = useNavigate()

  return (
    <PageWrapper showNavbar={false}>
      <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          {/* 404 Badge */}
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-32 h-32 bg-[#FFE5E5] border-2 border-[#111111] rounded-3xl shadow-[4px_4px_0px_#111111]">
              <span className="text-5xl font-bold text-[#111111]">404</span>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-[#111111] mb-3">
            Page Not Found
          </h1>

          {/* Description */}
          <p className="text-[#111111]/60 mb-8">
            Oops! The page you're looking for doesn't exist or has been moved.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <BrutalButton
              variant="neutral"
              onClick={() => navigate(-1)}
              className="flex items-center justify-center gap-2"
            >
              <IoArrowBack size={18} />
              Go Back
            </BrutalButton>

            <BrutalButton
              variant="primary"
              onClick={() => navigate('/')}
              className="flex items-center justify-center gap-2"
            >
              <IoHomeOutline size={18} />
              Home
            </BrutalButton>
          </div>
        </div>
      </div>
    </PageWrapper>
  )
}

export default NotFound
