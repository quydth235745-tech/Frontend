import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import ClientAxios from '../api/ClientAxios'
import { toast } from 'react-toastify'
import styles from './Admin.module.css'
import AdminTopBar from '../components/AdminTopBar'
import AdminDashboard from './AdminDashboard'
import AdminUsers from './AdminUsers'
import AdminOrders from './AdminOrders'

function Admin() {
  const [searchParams] = useSearchParams()
  const activeTabParam = searchParams.get('tab') || 'dashboard'
  const activeTab = ['dashboard', 'users', 'orders'].includes(activeTabParam)
    ? activeTabParam
    : 'dashboard'
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

  return (
    <div className={styles.container}>
      <div className={styles.maxWidth}>
        <AdminTopBar activeKey={activeTab} />

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <AdminDashboard foods={foods} orders={orders} users={users} />
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <AdminUsers users={users} onUsersUpdate={fetchAll} />
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <AdminOrders orders={orders} onOrdersUpdate={fetchAll} />
        )}
      </div>
    </div>
  )
}

export default Admin

