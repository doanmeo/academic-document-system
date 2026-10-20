import React, { Suspense, lazy } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'

// ─── Lazy Loaded Pages ────────────────────────────────────────────────────────
const Login = lazy(() => import('./pages/Login'))
const Register = lazy(() => import('./pages/Register'))
const Home = lazy(() => import('./pages/Home'))
const Search = lazy(() => import('./pages/Search'))
const DocumentDetail = lazy(() => import('./pages/DocumentDetail'))
const UploadDocument = lazy(() => import('./pages/UploadDocument'))
const EditDocument = lazy(() => import('./pages/EditDocument'))
const Profile = lazy(() => import('./pages/Profile'))
const MyDocuments = lazy(() => import('./pages/MyDocuments'))
const Bookmarks = lazy(() => import('./pages/Bookmarks'))
const MyReports = lazy(() => import('./pages/MyReports'))
const ExamBank = lazy(() => import('./pages/ExamBank'))
const TemplateCenter = lazy(() => import('./pages/TemplateCenter'))
const Collections = lazy(() => import('./pages/Collections'))

// Admin pages
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout'))
const Dashboard = lazy(() => import('./pages/admin/Dashboard'))
const PendingList = lazy(() => import('./pages/admin/PendingList'))
const AllDocuments = lazy(() => import('./pages/admin/AllDocuments'))
const Reports = lazy(() => import('./pages/admin/Reports'))
const UserManagement = lazy(() => import('./pages/admin/UserManagement'))

function PageLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#0b0f19]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-mono text-slate-500 dark:text-slate-400">Đang tải trang...</span>
      </div>
    </div>
  )
}

function App() {
  return (
    <Suspense fallback={<PageLoading />}>
      <Routes>
        {/* ─── Public ──────────────────────────────────────────────────────── */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<Home />} />
        <Route path="/search" element={<Search />} />
        <Route path="/exams" element={<ExamBank />} />
        <Route path="/templates" element={<TemplateCenter />} />
        <Route path="/collections/public/:shareToken" element={<Collections />} />

        {/* Chi tiết tài liệu — public với tài liệu APPROVED */}
        <Route path="/documents/:id" element={<DocumentDetail />} />

        {/* ─── Protected — Sinh viên ───────────────────────────────────────── */}
        <Route element={<ProtectedRoute />}>
          <Route path="/profile" element={<Profile />} />
          <Route path="/collections" element={<Collections />} />
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
    </Suspense>
  )
}

export default App
