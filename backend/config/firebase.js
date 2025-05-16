// Mock Firebase admin for development
const mockAdmin = {
  auth: () => ({
    verifyIdToken: async (token) => {
      // Mock user data
      return {
        uid: 'mock-user-id',
        email: 'test@example.com',
        name: 'Test User'
      };
    }
  })
};

module.exports = mockAdmin; 