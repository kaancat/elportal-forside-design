// /api/health.ts

// No imports, no TypeScript types. Just a plain function.
export default function handler(req, res) {
  res.status(200).json({ status: 'ok', from: 'pure-js-test' });
} 