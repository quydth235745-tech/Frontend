import React from 'react'
import ClientAxios from '../api/ClientAxios'
import { toast } from 'react-toastify'
import styles from './AdminUsers.module.css'

function AdminUsers({ users, onUsersUpdate }) {
  const handleChangeUserRole = async (id, newRole) => {
    try {
      await ClientAxios.patch(`/api/users/${id}/role`, { role: newRole })
      toast.success('✅ Cập nhật vai trò thành công')
      onUsersUpdate()
    } catch (err) {
      toast.error('❌ Lỗi khi cập nhật vai trò')
    }
  }

  const handleToggleBan = async (id, isBanned) => {
    try {
      const action = isBanned ? 'Mở khóa' : 'Khóa'
      const response = await ClientAxios.patch(`/api/users/${id}/ban`, {
        isBanned: !isBanned,
        bannedReason: isBanned ? null : 'Khóa bởi admin'
      })
      toast.success(`✅ ${action} tài khoản thành công`)
      onUsersUpdate()
    } catch (err) {
      toast.error(`❌ Lỗi khi ${isBanned ? 'mở khóa' : 'khóa'} tài khoản`)
    }
  }

  const handleDeleteUser = async (id, name) => {
    if (!window.confirm(`⚠️ Bạn chắc chắn muốn xóa tài khoản "${name}"? Hành động này không thể hoàn tác!`)) {
      return
    }

    try {
      await ClientAxios.delete(`/api/users/${id}`)
      toast.success('✅ Xóa tài khoản thành công')
      onUsersUpdate()
    } catch (err) {
      toast.error(err.response?.data?.message || '❌ Lỗi khi xóa tài khoản')
    }
  }

  return (
    <>
      <h2 className={styles.header}>👥 Quản Lý Tài Khoản</h2>
      <div className={styles.card}>
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead className={styles.tableHeader}>
              <tr>
                <th className={styles.tableHeadCell}>Tên</th>
                <th className={styles.tableHeadCell}>Email</th>
                <th className={styles.tableHeadCell}>Role</th>
                <th className={styles.tableHeadCell}>Trạng Thái</th>
                <th className={styles.tableHeadCell}>Hành Động</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u._id} className={styles.tableRow}>
                  <td className={`${styles.tableCell} ${styles.userName}`}>{u.name}</td>
                  <td className={`${styles.tableCell} ${styles.userEmail}`}>{u.email}</td>
                  <td className={styles.tableCell}>
                    <select
                      value={u.role}
                      onChange={(e) => handleChangeUserRole(u._id, e.target.value)}
                      className={styles.roleSelect}
                    >
                      <option value="user">👤 User</option>
                      <option value="admin">👑 Admin</option>
                    </select>
                  </td>
                  <td className={styles.tableCell}>
                    <span className={u.isBanned ? styles.bannedStatus : styles.activeStatus}>
                      {u.isBanned ? '🚫 Bị khóa' : '✅ Hoạt động'}
                    </span>
                  </td>
                  <td className={`${styles.tableCell} ${styles.actions}`}>
                    <button
                      onClick={() => handleToggleBan(u._id, u.isBanned)}
                      className={u.isBanned ? styles.unlockBtn : styles.lockBtn}
                    >
                      {u.isBanned ? '🔓 Mở khóa' : '🔐 Khóa'}
                    </button>
                    <button
                      onClick={() => handleDeleteUser(u._id, u.name)}
                      className={styles.deleteBtn}
                    >
                      🗑️ Xóa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}

export default AdminUsers


