// Global puzzle-piece counter for Vercel. Stores one number in Upstash Redis.
const URL_ = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
const KEY = 'puzzle_pieces_total';

async function redis(cmd) {
  const r = await fetch(`${URL_}/${cmd}/${KEY}`, { headers: { Authorization: `Bearer ${TOKEN}` } });
  if (!r.ok) throw new Error('redis ' + r.status);
  return (await r.json()).result;
}

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (!URL_ || !TOKEN) return res.status(503).json({ error: 'storage not configured' });
  try {
    const result = await redis(req.method === 'POST' ? 'incr' : 'get');
    res.status(200).json({ count: Number(result) || 0 });
  } catch (e) {
    res.status(500).json({ error: 'failed' });
  }
};
