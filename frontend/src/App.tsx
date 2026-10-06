import { Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import Register from './pages/Register'
import Home from './pages/Home'
import DocumentDetail from './pages/DocumentDetail'
import UploadDocument from './pages/UploadDocument'
import EditDocument from './pages/EditDocument'
import Profile from './pages/Profile'
import MyDocuments from './pages/MyDocuments'
import Bookmarks from './pages/Bookmarks'
import MyReports from './pages/MyReports'

// Admin pages — sẽ được uncomment sau khi Phase 6 hoàn thành
import AdminLayout from './pages/admin/AdminLayout'
import Dashboard from './pages/admin/Dashboard'
import PendingList from './pages/admin/PendingList'
import AllDocuments from './pages/admin/AllDocuments'
import Reports from './pages/admin/Reports'
import UserManagement from './pages/admin/UserManagement'

function App() {
  return (
    <Routes>
      {/* ─── Public ──────────────────────────────────────────────────────── */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/" element={<Home />} />

      {/* Chi tiết tài liệu — public với tài liệu APPROVED */}
      <Route path="/documents/:id" element={<DocumentDetail />} />

      {/* ─── Protected — Sinh viên ───────────────────────────────────────── */}
      <Route element={<ProtectedRoute />}>
        <Route path="/profile" element={<Profile />} />
        <Route path="/documents/upload" element={<UploadDocument />} />
        <Route path="/documents/:id/edit" element={<EditDocument />} />
        <Route path="/me/documents" element={<MyDocuments />} />
        <Route path="/me/bookmarks" element={<Bookmarks />} />
        <Route path="/me/reports" element={<MyReports />} />
      </Route>

      {/* ─── Protected — Admin only ──────────────────────────────────────── */}
      <Route element={<ProtectedRoute requiredRole="ADMIN" />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="pending" element={<PendingList />} />
          <Route path="documents" element={<AllDocuments />} />
          <Route path="reports" element={<Reports />} />
          <Route path="users" element={<UserManagement />} />
        </Route>
      </Route>

      {/* ─── Fallback ────────────────────────────────────────────────────── */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
