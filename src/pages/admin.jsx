import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import ClientAxios from '../api/ClientAxios'
import { toast } from 'react-toastify'
import styles from './Admin.module.css'
import AdminDashboard from './AdminDashboard'
import AdminFoods from './AdminFoods'
import AdminOrders from './AdminOrders'
import AdminUsers from './AdminUsers'

function Admin() {
  const [searchParams] = useSearchParams()
  const activeTab = searchParams.get('tab') || 'dashboard'
  const [foods, setFoods] = useState([])
  const [orders, setOrders] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchAll = async () => {
    setLoading(true)
    try {
      const [f, o, u] = await Promise.all([
        ClientAxios.get('/api/foods'),
        ClientAxios.get('/api/orders'),
        ClientAxios.get('/api/users')
      ])
      setFoods(f.data.data || [])
      setOrders(o.data.data || [])
      setUsers(u.data.data || [])
    } catch (err) {
      toast.error('❌ Không thể tải dữ liệu')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAll()
  }, [])


  if (loading) return <div className={styles.loading}>⏳ Đang tải dữ liệu...</div>

  const tabClass = (isActive) => isActive ? `${styles.tabButton} ${styles.active}` : styles.tabButton

  return (
    <div className={styles.container}>
      <div className={styles.maxWidth}>
        {/* Tab Navigation */}
        <div className={styles.tabsContainer}>
          <a href="/admin?tab=dashboard">
            <button className={tabClass(activeTab === 'dashboard')}>📊 Dashboard</button>
          </a>
          <a href="/admin?tab=foods">
            <button className={tabClass(activeTab === 'foods')}>🍔 Thêm Món</button>
          </a>
          <a href="/admin?tab=orders">
            <button className={tabClass(activeTab === 'orders')}>📦 Xử Lý Đơn</button>
          </a>
          <a href="/admin?tab=users">
            <button className={tabClass(activeTab === 'users')}>👥 Tài Khoản</button>
          </a>
          <a href="/admin/khuyenmai">
            <button className={styles.tabButton}>🎁 Khuyến Mãi</button>
          </a>
          <a href="/admin/monan">
            <button className={styles.tabButton}>🍽️ Thực Đơn</button>
          </a>
          <a href="/admin/donhang">
            <button className={styles.tabButton}>🛒 Đơn Hàng</button>
          </a>
          <a href="/admin/binhluan">
            <button className={styles.tabButton}>💬 Bình Luận</button>
          </a>
          <a href="/admin/thanhtoan">
            <button className={styles.tabButton}>💳 Thanh Toán</button>
          </a>
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <AdminDashboard foods={foods} orders={orders} users={users} />
        )}

        {/* Foods Tab */}
        {activeTab === 'foods' && (
          <AdminFoods foods={foods} setFoods={setFoods} onFoodsUpdate={fetchAll} />
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <AdminOrders orders={orders} onOrdersUpdate={fetchAll} />
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <AdminUsers users={users} onUsersUpdate={fetchAll} />
        )}
      </div>
    </div>
  )
}

export default Admin

