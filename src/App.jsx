import React, { useContext, lazy, Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation, Navigate } from 'react-router-dom'
import { GoogleOAuthProvider } from '@react-oauth/google'
import ChanRaLoi from './components/ChanRaLoi'
import { AuthProvider, AuthContext } from './context/ContextXacThuc'
import TuyenBaoVe from './routes/TuyenBaoVe'

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

const TrangDau = lazy(() => import('./pages/TrangDau'));
const TrangChu = lazy(() => import('./pages/TrangChu'));
const DangNhap = lazy(() => import('./pages/DangNhap'));
const DangKy = lazy(() => import('./pages/DangKy'));
const GioHang = lazy(() => import('./pages/GioHang'));
const QuanLyAdmin = lazy(() => import('./pages/QuanLyAdmin'));
const ChiTietMon = lazy(() => import('./pages/ChiTietMon'));
const DonHangKhachHang = lazy(() => import('./pages/DonHangKhachHang'));
const ChiTietDonHangKhachHang = lazy(() => import('./pages/ChiTietDonHangKhachHang'));
const DoiMatKhau = lazy(() => import('./pages/DoiMatKhau'));
const AdminKhuyenMai = lazy(() => import('./pages/AdminKhuyenMai'));
const AdminKhuyenMaiThem = lazy(() => import('./pages/AdminKhuyenMaiThem'));
const AdminKhuyenMaiSua = lazy(() => import('./pages/AdminKhuyenMaiSua'));
const AdminMonAn = lazy(() => import('./pages/AdminMonAn'));
const AdminMonAnThem = lazy(() => import('./pages/AdminMonAnThem'));
const AdminMonAnSua = lazy(() => import('./pages/AdminMonAnSua'));
const AdminDonHang = lazy(() => import('./pages/AdminDonHang'));
const AdminDonHangChiTiet = lazy(() => import('./pages/AdminDonHangChiTiet'));
const AdminBinhLuan = lazy(() => import('./pages/AdminBinhLuan'));
const AdminThanhToan = lazy(() => import('./pages/AdminThanhToan'));
const AdminInHoaDon = lazy(() => import('./pages/AdminInHoaDon'));

// Tách Navbar thành component riêng
function Navbar() {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();

  const handleLogout = () => {
    logout();
    toast.info('Bạn đã đăng xuất thành công!');
    navigate('/login');
  };

  const isAdminPage = location.pathname.startsWith('/admin');

  return (
    <nav className="navbar" style={{ 
      padding: '0', 
      backgroundColor: '#ff9f43', 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center',
      flexWrap: 'wrap',
      minHeight: '82px'
    }}>
      {/* LEFT: Logo + Main Navigation */}
      <div style={{ display: 'flex', gap: '0', alignItems: 'center' }}>
        <Link to="/" style={{ color: '#000', textDecoration: 'none', fontWeight: 'bold', padding: '22px 26px', borderRight: '1px solid rgba(0,0,0,0.1)' }}>🏠 Trang Chủ</Link>
        <Link to="/menu" style={{ color: '#000', textDecoration: 'none', fontWeight: 'bold', padding: '22px 26px', borderRight: '1px solid rgba(0,0,0,0.1)' }}>📖 Menu</Link>
        
        {/* Show Customer Links for logged in customers */}
        {user && user?.role !== 'admin' && (
          <>
            <Link to="/cart" style={{ color: '#000', textDecoration: 'none', fontWeight: 'bold', padding: '22px 26px', borderRight: '1px solid rgba(0,0,0,0.1)' }}>🛒 Giỏ Hàng</Link>
            <Link to="/orders" style={{ color: '#000', textDecoration: 'none', fontWeight: 'bold', padding: '22px 26px', borderRight: '1px solid rgba(0,0,0,0.1)' }}>📋 Đơn Hàng</Link>
          </>
        )}
        
        {/* Show Quản Lý for logged in users */}
        {user && (
          <>
            {user?.role !== 'admin' && (
              <Link to="/change-password" style={{ color: '#000', textDecoration: 'none', fontWeight: 'bold', padding: '22px 26px', borderRight: '1px solid rgba(0,0,0,0.1)' }}>🔒 Đổi mật khẩu</Link>
            )}
            {user?.role === 'admin' && (
              <>
                <Link to="/change-password" style={{ color: '#000', textDecoration: 'none', fontWeight: 'bold', padding: '22px 26px', borderRight: '1px solid rgba(0,0,0,0.1)' }}>🔒 Đổi mật khẩu</Link>
                <Link to="/admin" style={{ color: '#000', textDecoration: 'none', fontWeight: 'bold', padding: '22px 26px', borderRight: '1px solid rgba(0,0,0,0.1)' }}>⚙️ Quản Lý</Link>
              </>
            )}
          </>
        )}
      </div>

      {/* RIGHT: User info + Logout */}
      <div style={{ display: 'flex', gap: '0', alignItems: 'center' }}>
        {!user ? (
          <>
            <Link to="/login" style={{ color: '#000', textDecoration: 'none', fontWeight: 'bold', padding: '22px 26px', borderLeft: '1px solid rgba(0,0,0,0.1)' }}>🔑 Đăng Nhập</Link>
            <Link to="/register" style={{ color: '#000', textDecoration: 'none', fontWeight: 'bold', padding: '22px 26px', borderLeft: '1px solid rgba(0,0,0,0.1)' }}>📝 Đăng Ký</Link>
          </>
        ) : (
          <>
            <span style={{ color: '#000', fontWeight: 'bold', padding: '22px 26px', borderLeft: '1px solid rgba(0,0,0,0.1)' }}>Chào, {user.name || 'bạn'}!</span>
            <button 
              onClick={handleLogout}
              style={{ 
                backgroundColor: '#ff4757', 
                color: 'white', 
                border: 'none', 
                padding: '22px 26px', 
                cursor: 'pointer', 
                fontWeight: 'bold',
                transition: '0.3s',
                borderLeft: '1px solid rgba(0,0,0,0.1)'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#ff6b81'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#ff4757'}
            >
              Đăng Xuất
            </button>
          </>
        )}
      </div>
    </nav>
  );
}

function CartRoute() {
  const { user, isLoading } = useContext(AuthContext);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (user?.role === 'admin') {
    return <Navigate to="/" replace />;
  }

  return <GioHang />;
}

function AppContent() {
  const { user } = useContext(AuthContext);

  return (
    <>
      <Navbar />

      <div className="routes-container">
        <Suspense fallback={<div>Dang tai trang...</div>}>
          <Routes>
            <Route path="/" element={<TrangDau />} />
            <Route path="/menu" element={<TrangChu />} />
            <Route path="/login" element={<DangNhap />} />
            <Route path="/register" element={<DangKy />} />
            <Route path="/cart" element={<CartRoute />} />
            <Route path="/orders" element={<TuyenBaoVe><DonHangKhachHang /></TuyenBaoVe>} />
            <Route path="/orders/:id" element={<TuyenBaoVe><ChiTietDonHangKhachHang /></TuyenBaoVe>} />
            <Route path="/change-password" element={<TuyenBaoVe><DoiMatKhau /></TuyenBaoVe>} />
            <Route
              path="/admin"
              element={
                <TuyenBaoVe allowedRoles={[ 'admin' ]}>
                  <QuanLyAdmin />
                </TuyenBaoVe>
              }
            />
            {/* Khuyến Mãi Routes */}
            <Route path="/admin/khuyenmai" element={<TuyenBaoVe allowedRoles={['admin']}><AdminKhuyenMai /></TuyenBaoVe>} />
            <Route path="/admin/khuyenmai/them" element={<TuyenBaoVe allowedRoles={['admin']}><AdminKhuyenMaiThem /></TuyenBaoVe>} />
            <Route path="/admin/khuyenmai/sua/:id" element={<TuyenBaoVe allowedRoles={['admin']}><AdminKhuyenMaiSua /></TuyenBaoVe>} />
            {/* Món Ăn Routes */}
            <Route path="/admin/monan" element={<TuyenBaoVe allowedRoles={['admin']}><AdminMonAn /></TuyenBaoVe>} />
            <Route path="/admin/monan/them" element={<TuyenBaoVe allowedRoles={['admin']}><AdminMonAnThem /></TuyenBaoVe>} />
            <Route path="/admin/monan/sua/:id" element={<TuyenBaoVe allowedRoles={['admin']}><AdminMonAnSua /></TuyenBaoVe>} />
            {/* Đơn Hàng Routes */}
            <Route path="/admin/donhang" element={<TuyenBaoVe allowedRoles={['admin']}><AdminDonHang /></TuyenBaoVe>} />
            <Route path="/admin/donhang/:id" element={<TuyenBaoVe allowedRoles={['admin']}><AdminDonHangChiTiet /></TuyenBaoVe>} />
            {/* Bình Luận Routes */}
            <Route path="/admin/binhluan" element={<TuyenBaoVe allowedRoles={['admin']}><AdminBinhLuan /></TuyenBaoVe>} />
            {/* Thanh Toán Routes */}
            <Route path="/admin/thanhtoan" element={<TuyenBaoVe allowedRoles={['admin']}><AdminThanhToan /></TuyenBaoVe>} />
            {/* In Hóa Đơn Routes */}
            <Route path="/admin/inhoadon/:id" element={<TuyenBaoVe allowedRoles={['admin']}><AdminInHoaDon /></TuyenBaoVe>} />
            <Route path="/food/:id" element={<ChiTietMon />} />
          </Routes>
        </Suspense>
      </div>

      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
}

function App() {
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const enableGoogleLogin = import.meta.env.VITE_ENABLE_GOOGLE_LOGIN === 'true' && !!googleClientId;
  
  if (!enableGoogleLogin) {
    return (
      <ChanRaLoi>
        <AuthProvider>
          <Router>
            <AppContent />
          </Router>
        </AuthProvider>
      </ChanRaLoi>
    )
  }

  return (
    <ChanRaLoi>
      <GoogleOAuthProvider clientId={googleClientId}>
        <AuthProvider>
          <Router>
            <AppContent />
          </Router>
        </AuthProvider>
      </GoogleOAuthProvider>
    </ChanRaLoi>
  )
}

export default App