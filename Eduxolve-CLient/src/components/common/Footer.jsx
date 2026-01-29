/**
 * Footer - Global footer component for all pages
 * Follows Soft Neubrutalism design
 */

function Footer() {
  return (
    <footer className="px-6 py-12 border-t-2 border-[#111111] bg-[#FAFAF7]">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand Section */}
          <aside className="md:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-[#4ECDC4] border-2 border-[#111111] rounded-xl shadow-[2px_2px_0px_#111111] flex items-center justify-center">
                <span className="text-xl font-bold text-[#111111]">E</span>
              </div>
              <span className="text-xl font-bold text-[#111111]">EduXolve</span>
            </div>
            <p className="text-[#111111]/60 text-sm">
              AI-powered supplementary learning platform for university courses.
              <br />
              Built for learners, by learners.
            </p>
          </aside>

          {/* Platform Links */}
          <nav>
            <h6 className="font-bold text-[#111111] mb-4 uppercase text-sm tracking-wide">Platform</h6>
            <ul className="space-y-2">
              <li><a href="/search" className="text-[#111111]/70 hover:text-[#111111] transition-colors text-sm no-underline">Search Materials</a></li>
              <li><a href="/chat" className="text-[#111111]/70 hover:text-[#111111] transition-colors text-sm no-underline">AI Chat</a></li>
              <li><a href="/generate" className="text-[#111111]/70 hover:text-[#111111] transition-colors text-sm no-underline">Generate Content</a></li>
              <li><a href="/dashboard" className="text-[#111111]/70 hover:text-[#111111] transition-colors text-sm no-underline">Dashboard</a></li>
            </ul>
          </nav>

          {/* Company Links */}
          <nav>
            <h6 className="font-bold text-[#111111] mb-4 uppercase text-sm tracking-wide">Company</h6>
            <ul className="space-y-2">
              <li><a href="#" className="text-[#111111]/70 hover:text-[#111111] transition-colors text-sm no-underline">About Us</a></li>
              <li><a href="#" className="text-[#111111]/70 hover:text-[#111111] transition-colors text-sm no-underline">Contact</a></li>
              <li><a href="#" className="text-[#111111]/70 hover:text-[#111111] transition-colors text-sm no-underline">Careers</a></li>
              <li><a href="#" className="text-[#111111]/70 hover:text-[#111111] transition-colors text-sm no-underline">Blog</a></li>
            </ul>
          </nav>

          {/* Legal Links */}
          <nav>
            <h6 className="font-bold text-[#111111] mb-4 uppercase text-sm tracking-wide">Legal</h6>
            <ul className="space-y-2">
              <li><a href="#" className="text-[#111111]/70 hover:text-[#111111] transition-colors text-sm no-underline">Terms of Use</a></li>
              <li><a href="#" className="text-[#111111]/70 hover:text-[#111111] transition-colors text-sm no-underline">Privacy Policy</a></li>
              <li><a href="#" className="text-[#111111]/70 hover:text-[#111111] transition-colors text-sm no-underline">Cookie Policy</a></li>
            </ul>
          </nav>
        </div>

        {/* Bottom Bar */}
        <div className="mt-10 pt-6 border-t-2 border-[#111111]/10 text-center">
          <p className="text-[#111111]/50 text-sm">
            © 2026 EduXolve. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
