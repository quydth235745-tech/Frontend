import React, { useCallback, useEffect, useState } from 'react'
import ClientAxios from '../api/ClientAxios'
import { toast } from 'react-toastify'
import { Link } from 'react-router-dom'
import {
  getOrderCode,
  getOrderId,
  getOrderStatusLabel,
  getOrderTotal,
  normalizeOrderStatus
} from '../utils/orderMapper'

function Orders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const orderSteps = ['Đặt hàng', 'Xác nhận', 'Chuẩn bị', 'Sẵn sàng', 'Đang giao', 'Giao thành công']
  const statusStepIndex = {
    pending: 0,
    confirmed: 1,
    preparing: 2,
    ready: 3,
    shipping: 4,
    delivered: 5,
    cancelled: -1
  }

  const getStepIndex = (status) => {
    const normalized = normalizeOrderStatus(status)
    return statusStepIndex[normalized] ?? 0
  }

  const fetchOrders = useCallback(async (silent = false) => {
    if (!silent) {
      setLoading(true)
    }

    try {
      const res = await ClientAxios.get('/api/orders')
      setOrders(res.data.data || [])
      setError('')
    } catch (err) {
      const message = err.response?.data?.message || 'Không tải được đơn hàng.'
      setError(message)
      if (!silent) {
        toast.error(message)
      }
    } finally {
      if (!silent) {
        setLoading(false)
      }
    }
  }, [])

  useEffect(() => {
    fetchOrders()

    const intervalId = setInterval(() => {
      fetchOrders(true)
    }, 8000)

    const handleFocus = () => fetchOrders(true)
    window.addEventListener('focus', handleFocus)

    return () => {
      clearInterval(intervalId)
      window.removeEventListener('focus', handleFocus)
    }
  }, [fetchOrders])

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '40px' }}>Đang tải đơn hàng...</div>
  }

  if (error) {
    return <div style={{ textAlign: 'center', padding: '40px', color: '#ff4757' }}>{error}</div>
  }

  return (
    <div style={{ padding: '40px 20px', minHeight: '100vh', backgroundColor: '#f0f2f5', fontFamily: 'Arial' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <Link to="/" style={{ color: '#747d8c', textDecoration: 'none', fontSize: '14px' }}>🏠 Menu</Link>
        <span style={{ color: '#a4b0be', margin: '0 10px' }}>/</span>
        <span style={{ color: '#2f3542', fontWeight: 'bold', fontSize: '14px' }}>Đơn hàng của bạn</span>

        <h2 style={{ margin: '25px 0 20px', color: '#2f3542' }}>📦 Lịch sử đơn hàng</h2>

        {orders.length === 0 ? (
          <div style={{ padding: '30px', backgroundColor: 'white', borderRadius: '20px', textAlign: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
            <p style={{ margin: 0, fontSize: '16px', color: '#57606f' }}>Bạn chưa có đơn hàng nào.</p>
            <Link to="/" style={{ marginTop: '20px', display: 'inline-block', padding: '12px 25px', backgroundColor: '#ff6b81', color: 'white', borderRadius: '10px', textDecoration: 'none' }}>Tiếp tục mua sắm</Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '20px' }}>
            {orders.map(order => (
              <div key={getOrderId(order)} style={{ backgroundColor: 'white', borderRadius: '20px', padding: '25px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                  <div>
                    <h3 style={{ margin: '0 0 8px', color: '#2f3542' }}>Đơn #{getOrderCode(order)}</h3>
                    <p style={{ margin: 0, color: '#57606f' }}>{new Date(order.createdAt || order.ngay_dat).toLocaleString()}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ margin: 0, color: '#57606f', fontSize: '13px' }}>Trạng thái</p>
                    <span style={{ display: 'inline-block', marginTop: '6px', padding: '8px 16px', borderRadius: '999px', backgroundColor: normalizeOrderStatus(order.status) === 'pending' ? '#ffeaa7' : normalizeOrderStatus(order.status) === 'confirmed' ? '#a29bfe' : normalizeOrderStatus(order.status) === 'preparing' ? '#fdcb6e' : normalizeOrderStatus(order.status) === 'ready' ? '#74b9ff' : normalizeOrderStatus(order.status) === 'shipping' ? '#81ecec' : normalizeOrderStatus(order.status) === 'delivered' ? '#55efc4' : '#dfe6e9', color: '#000', fontWeight: 'bold', fontSize: '13px' }}>
                      {getOrderStatusLabel(order.status)}
                    </span>
                  </div>
                </div>

                {/* Order Timeline Steps */}
                <div style={{ marginTop: '25px', paddingTop: '20px', borderTop: '1px solid #f1f2f6' }}>
                  <p style={{ margin: '0 0 18px', color: '#57606f', fontWeight: 'bold', fontSize: '13px' }}>📋 Quá trình xử lý đơn hàng</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', position: 'relative' }}>
                    <div style={{ position: 'absolute', top: '16px', left: 0, right: 0, height: '2px', backgroundColor: '#e0e0e0', zIndex: 0 }} />
                    {orderSteps.map((step, idx) => {
                      const currentIndex = getStepIndex(order.status)
                      const isCurrent = idx === currentIndex
                      const isCompleted = idx < currentIndex
                      return (
                        <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1, position: 'relative' }}>
                          <div style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            backgroundColor: isCompleted ? '#55efc4' : isCurrent ? '#ff9f43' : '#e0e0e0',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: isCompleted || isCurrent ? '#fff' : '#999',
                            fontWeight: 'bold',
                            fontSize: '12px',
                            marginBottom: '8px'
                          }}>
                            {isCompleted ? '✓' : idx + 1}
                          </div>
                          <p style={{ margin: 0, color: isCompleted || isCurrent ? '#2c3e50' : '#95a5a6', fontWeight: isCompleted || isCurrent ? '600' : '400', fontSize: '11px', textAlign: 'center' }}>
                            {step}
                          </p>
                        </div>
                      )
                    })}
                  </div>
                </div>

                <div style={{ marginTop: '20px', borderTop: '1px solid #f1f2f6', paddingTop: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                    <div>
                      <p style={{ margin: '0 0 6px', color: '#57606f' }}>Tổng tiền</p>
                      <p style={{ margin: 0, fontSize: '18px', color: '#ff4757', fontWeight: 'bold' }}>{getOrderTotal(order).toLocaleString()} VNĐ</p>
                    </div>
                    <div>
                      <p style={{ margin: '0 0 6px', color: '#57606f' }}>Địa chỉ giao</p>
                      <p style={{ margin: 0, color: '#2f3542' }}>{order.address}</p>
                    </div>
                  </div>

                  <div style={{ marginTop: '18px' }}>
                    <p style={{ margin: '0 0 10px', color: '#57606f', fontWeight: 'bold' }}>Danh sách món</p>
                    <ul style={{ paddingLeft: '18px', margin: 0, color: '#2f3542' }}>
                      {order.items.map((item, idx) => (
                        <li key={item.foodId || item._id || idx} style={{ marginBottom: '6px' }}>
                          {item.name} x{item.quantity} - {(Number(item.price || 0) * Number(item.quantity || 0)).toLocaleString()} VNĐ
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
                    <Link to={`/orders/${getOrderId(order)}`} style={{ padding: '10px 20px', backgroundColor: '#3742fa', color: '#ffffff', borderRadius: '14px', textDecoration: 'none', fontWeight: 'bold' }}>
                      Xem chi tiết
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Orders


