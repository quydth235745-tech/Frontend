import React, { useContext, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { GoogleLogin } from '@react-oauth/google'
import ClientAxios from '../api/ClientAxios'
import { AuthContext } from '../context/ContextXacThuc'

function Login() {
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  
  // Thêm biến state để quản lý việc ẩn/hiện mật khẩu
  const [showPassword, setShowPassword] = useState(false)

  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { login } = useContext(AuthContext)
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
  const rawEnableGoogleLogin = String(import.meta.env.VITE_ENABLE_GOOGLE_LOGIN || '').trim()
  const enableGoogleLogin = /^(1|true|yes)$/i.test(rawEnableGoogleLogin) && !!googleClientId

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await ClientAxios.post('/api/auth/login', { identifier, password })
      toast.success('Đăng nhập thành công!')
      localStorage.setItem('token', res.data.token)
      login(res.data.user)
      navigate('/')
    } catch (err) {
      if (!err.response) {
        toast.error('Không kết nối được máy chủ. Hãy kiểm tra backend đang chạy ở cổng 3000.')
      } else {
        toast.error(err.response?.data?.message || 'Sai tài khoản hoặc mật khẩu rồi bạn ơi!')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const res = await ClientAxios.post('/api/auth/google-login', {
        token: credentialResponse.credential
      })
      toast.success('Đăng nhập Google thành công!')
      localStorage.setItem('token', res.data.token)
      login(res.data.user)
      navigate('/')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Đăng nhập Google thất bại!')
    }
  }

  const handleGoogleError = () => {
    toast.error('Đăng nhập Google thất bại!')
  }

  return (
    <div style={{ textAlign: 'center', marginTop: '100px' }}>
      <h2>🔑 ĐĂNG NHẬP HỆ THỐNG</h2>
      <form onSubmit={handleLogin} style={{ display: 'inline-block', textAlign: 'left', padding: '20px', border: '1px solid #ccc', borderRadius: '10px' }}>
        
        <div style={{ marginBottom: '10px' }}>
          <label>Tên đăng nhập hoặc Email:</label><br/>
          <input 
            type="text" 
            value={identifier} 
            onChange={(e) => setIdentifier(e.target.value)} 
            required 
            style={{ width: '250px', padding: '8px' }} 
          />
        </div>
        
        <div style={{ marginBottom: '10px' }}>
          <label>Mật khẩu:</label><br/>
          {/* Thay đổi type giữa 'password' và 'text' dựa vào state showPassword */}
          <input 
            type={showPassword ? "text" : "password"} 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
            style={{ width: '250px', padding: '8px' }} 
          />
        </div>

        {/* Nút Checkbox để chọn hiện/ẩn mật khẩu */}
        <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '5px' }}>
          <input 
            type="checkbox" 
            id="showPass"
            checked={showPassword}
            onChange={() => setShowPassword(!showPassword)}
            style={{ cursor: 'pointer' }}
          />
          <label htmlFor="showPass" style={{ fontSize: '14px', cursor: 'pointer' }}>
            Hiển thị mật khẩu
          </label>
        </div>

        <button type="submit" disabled={loading} style={{ width: '100%', padding: '10px', backgroundColor: '#2ed573', color: 'white', border: 'none', borderRadius: '5px', cursor: loading ? 'not-allowed' : 'pointer' }}>
          {loading ? 'Đang xử lý...' : 'Vào hệ thống'}
        </button>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', marginTop: '15px' }}>
          {enableGoogleLogin ? (
            <>
              <p>Hoặc đăng nhập bằng:</p>
              <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                <GoogleLogin 
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  width="280"
                />
              </div>
            </>
          ) : (
            <p style={{ color: '#64748b', fontSize: '13px' }}>
              Đăng nhập Google đang tắt hoặc chưa cấu hình client ID.
            </p>
          )}
        </div>
      </form>
    </div>
  )
}

export default Login


