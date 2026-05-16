import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import LandingPage from '@/components/LandingPage'
import ChatApp from '@/components/ChatApp'
import { ThemeProvider } from '@/components/theme-provider'

function ProtectedApp() {
  const apiKey = localStorage.getItem('VITE_NVIDIA_API_KEY')

  if (!apiKey) {
    return <Navigate to="/" replace />
  }

  return <ChatApp />
}

function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/app" element={<ProtectedApp />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  useEffect(() => {
    // Initialize theme - always use dark theme
    const root = document.documentElement
    root.classList.add('dark')
  }, [])

  return (
    <ThemeProvider defaultTheme="dark" storageKey="codebolt-theme">
      <BrowserRouter>
        <AppRouter />
      </BrowserRouter>
    </ThemeProvider>
  )
}
