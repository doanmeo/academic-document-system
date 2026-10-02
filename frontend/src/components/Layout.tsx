import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import { Toaster } from 'sonner'

export default function Layout() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900 antialiased">
      <Toaster position="top-right" richColors />
      <Navbar />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
      <footer className="bg-white border-t border-gray-200 py-6 text-center text-xs text-gray-500">
        <p>© 2026 Academic Document System — Khoa Công nghệ Thông tin</p>
      </footer>
    </div>
  )
}
