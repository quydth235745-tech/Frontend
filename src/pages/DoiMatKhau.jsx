import React, { useState } from 'react'
import ClientAxios from '../api/ClientAxios'
import { toast } from 'react-toastify'

function ChangePassword() {
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showOld, setShowOld] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!oldPassword || !newPassword || !confirmPassword) {
      toast.warn('Vui lòng điền đầy đủ các trường.');
      return
    }

    if (newPassword !== confirmPassword) {
      toast.warn('Mật khẩu mới và xác nhận không khớp.');
      return
    }

    if (newPassword.length < 6) {
      toast.warn('Mật khẩu mới phải có ít nhất 6 ký tự.');
      return
    }

    setLoading(true)
    try {
      await ClientAxios.patch('/api/auth/change-password', {
        oldPassword,
        newPassword,
        confirmPassword,
      })
      toast.success('Đổi mật khẩu thành công!')
      setOldPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Đổi mật khẩu thất bại.');
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: '40px 20px', minHeight: '100vh', backgroundColor: '#f0f2f5', fontFamily: 'Arial' }}>
      <div style={{ maxWidth: '520px', margin: '0 auto' }}>
        <h2 style={{ marginBottom: '20px', color: '#2f3542' }}>🔒 Đổi mật khẩu</h2>
        <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '18px' }}>
            <label style={{ color: '#57606f' }}>
              Mật khẩu cũ
              <input
                type={showOld ? 'text' : 'password'}
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="Nhập mật khẩu cũ"
                required
                style={{ width: '100%', padding: '12px', marginTop: '8px', borderRadius: '12px', border: '1px solid #dcdde1' }}
              />
            </label>
            <label style={{ color: '#57606f' }}>
              Mật khẩu mới
              <input
                type={showNew ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Tối thiểu 6 ký tự"
                required
                style={{ width: '100%', padding: '12px', marginTop: '8px', borderRadius: '12px', border: '1px solid #dcdde1' }}
              />
            </label>
            <label style={{ color: '#57606f' }}>
              Xác nhận mật khẩu mới
              <input
                type={showConfirm ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Nhập lại mật khẩu mới"
                required
                style={{ width: '100%', padding: '12px', marginTop: '8px', borderRadius: '12px', border: '1px solid #dcdde1' }}
              />
            </label>
            <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', alignItems: 'center' }}>
              <label style={{ display: 'flex', gap: '8px', alignItems: 'center', color: '#57606f' }}>
                <input type="checkbox" checked={showOld} onChange={() => setShowOld(!showOld)} />
                Hiển thị mật khẩu cũ
              </label>
              <label style={{ display: 'flex', gap: '8px', alignItems: 'center', color: '#57606f' }}>
                <input type="checkbox" checked={showNew} onChange={() => setShowNew(!showNew)} />
                Hiển thị mật khẩu mới
              </label>
              <label style={{ display: 'flex', gap: '8px', alignItems: 'center', color: '#57606f' }}>
                <input type="checkbox" checked={showConfirm} onChange={() => setShowConfirm(!showConfirm)} />
                Hiển thị xác nhận
              </label>
            </div>
            <button type="submit" disabled={loading} style={{ width: '100%', padding: '14px', backgroundColor: '#3742fa', color: 'white', border: 'none', borderRadius: '14px', fontWeight: 'bold', cursor: loading ? 'not-allowed' : 'pointer' }}>
              {loading ? 'Đang đổi mật khẩu...' : 'Đổi mật khẩu'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ChangePassword


