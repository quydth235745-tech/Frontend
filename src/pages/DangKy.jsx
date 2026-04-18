import React, { useState } from 'react'
import ClientAxios from '../api/ClientAxios'
import { useNavigate } from 'react-router-dom'

function Register() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()

  const handleRegister = async (e) => {
    e.preventDefault()
    try {
      // Gọi API đăng ký mà mình đã viết ở Backend
      await ClientAxios.post('/api/auth/register', { name, email, password })
      alert("Đăng ký thành công! Giờ đăng nhập thử xem ní ơi!")
      navigate('/login') // Đăng ký xong tự nhảy sang trang Đăng nhập luôn cho tiện
    } catch (err) {
      alert("Lỗi rồi: " + (err.response?.data?.message || "Không đăng ký được ní ơi!"))
    }
  }

  return (
    <div style={{ textAlign: 'center', marginTop: '80px' }}>
      <h2>📝 TẠO TÀI KHOẢN MỚI</h2>
      <form onSubmit={handleRegister} style={{ display: 'inline-block', textAlign: 'left', padding: '25px', border: '1px solid #ddd', borderRadius: '12px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
        <div style={{ marginBottom: '10px' }}>
          <label>Họ và Tên:</label><br/>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} required style={{ width: '250px', padding: '8px', borderRadius: '5px', border: '1px solid #ccc' }} />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label>Email:</label><br/>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ width: '250px', padding: '8px', borderRadius: '5px', border: '1px solid #ccc' }} />
        </div>
        <div style={{ marginBottom: '20px' }}>
          <label>Mật khẩu:</label><br/>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ width: '250px', padding: '8px', borderRadius: '5px', border: '1px solid #ccc' }} />
        </div>
        <button type="submit" style={{ width: '100%', padding: '12px', backgroundColor: '#1e90ff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>Xác Nhận Đăng Ký</button>
      </form>
    </div>
  )
}

export default Register

