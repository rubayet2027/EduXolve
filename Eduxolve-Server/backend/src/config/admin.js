/**
 * Admin Configuration
 * 
 * Hardcoded admin credentials for demo purposes.
 * In production, this would be replaced with proper IAM/role claims.
 * 
 * ⚠️ FOR HACKATHON DEMO ONLY
 */

const ADMIN_CREDENTIALS = [
  {
    email: 'admin@eduxolve.com',
    password: 'Admin@123'
  },
  {
    email: 'admin@university.edu',
    password: 'Admin@123'
  }
];

/**
 * Check if credentials match an admin account
 * @param {string} email - Email to check
 * @param {string} password - Password to check
 * @returns {boolean} True if credentials match an admin
 */
const isAdminCredentials = (email, password) => {
  return ADMIN_CREDENTIALS.some(
    admin => admin.email.toLowerCase() === email.toLowerCase() && admin.password === password
  );
};

/**
 * Check if email belongs to an admin
 * @param {string} email - Email to check
 * @returns {boolean} True if email is an admin email
 */
const isAdminEmail = (email) => {
  return ADMIN_CREDENTIALS.some(
    admin => admin.email.toLowerCase() === email.toLowerCase()
  );
};

module.exports = {
  ADMIN_CREDENTIALS,
  isAdminCredentials,
  isAdminEmail
};
