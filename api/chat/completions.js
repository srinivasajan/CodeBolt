const NVIDIA_API_BASE = 'https://integrate.api.nvidia.com/v1'

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const apiKey = process.env.VITE_NVIDIA_API_KEY
  if (!apiKey) {
    return res.status(400).json({ error: 'NVIDIA API key not configured' })
  }

  try {
    const response = await fetch(`${NVIDIA_API_BASE}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(req.body),
    })

    const contentType = response.headers.get('content-type') || 'text/plain'
    res.status(response.status)
    res.setHeader('Content-Type', contentType)
    res.setHeader('Cache-Control', 'no-store')

    if (!response.body) {
      const text = await response.text()
      return res.send(text)
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()

    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        res.write(decoder.decode(value, { stream: true }))
      }
    } finally {
      reader.releaseLock()
      res.end()
    }
  } catch (error) {
    console.error('NVIDIA proxy error:', error)
    return res.status(500).json({ error: error instanceof Error ? error.message : String(error) })
  }
}