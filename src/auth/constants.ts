export const jwtConstants = {
  secret: process.env.JWT_SECRET! || '9f3a7c8d2e6b4f1a8c9e7d6b5a4c3f2e', // ❌ NO fallback
};
