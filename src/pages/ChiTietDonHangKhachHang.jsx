import React, { useCallback, useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import ClientAxios from '../api/ClientAxios'
import { toast } from 'react-toastify'
import OrderTracking from '../components/ThoiGianDonHang'
import {
  canCancelOrder,
  getCustomerName,
  getOrderCode,
  getOrderStatusLabel,
  getOrderTotal,
  normalizeOrderStatus
} from '../utils/orderMapper'

function OrderDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [cancelling, setCancelling] = useState(false)
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [submittingComment, setSubmittingComment] = useState(false)
  const [commentSent, setCommentSent] = useState(false)

  const fetchOrder = useCallback(async (silent = false) => {
    if (!silent) {
      setLoading(true)
    }

    try {
      const res = await ClientAxios.get(`/api/orders/${id}`)
      setOrder(res.data.data || res.data)
      setError('')
    } catch (err) {
      const message = err.response?.data?.message || 'Không tải được chi tiết đơn hàng.'
      setError(message)
      if (!silent) {
        toast.error(message)
      }
    } finally {
      if (!silent) {
        setLoading(false)
      }
    }
  }, [id])

  useEffect(() => {
    fetchOrder()

    const intervalId = setInterval(() => {
      fetchOrder(true)
    }, 8000)

    const handleFocus = () => fetchOrder(true)
    window.addEventListener('focus', handleFocus)

    return () => {
      clearInterval(intervalId)
      window.removeEventListener('focus', handleFocus)
    }
  }, [fetchOrder])

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '40px' }}>Đang tải chi tiết đơn...</div>
  }

  if (error) {
    return <div style={{ textAlign: 'center', padding: '40px', color: '#ff4757' }}>{error}</div>
  }

  if (!order) {
    return <div style={{ textAlign: 'center', padding: '40px' }}>Không tìm thấy đơn hàng.</div>
  }

  const allowCancel = canCancelOrder(order?.status)
  const isDelivered = normalizeOrderStatus(order?.status) === 'delivered'

  const handleCancelOrder = async () => {
    if (!window.confirm('⚠️ Bạn chắc chắn muốn hủy đơn hàng này? Hành động này không thể hoàn tác!')) {
      return
    }

    setCancelling(true)
    try {
      await ClientAxios.patch(`/api/orders/${id}/status`, { status: 'cancelled' })
      toast.success('✅ Đơn hàng đã bị hủy!')
      setTimeout(() => navigate('/orders'), 1500)
    } catch (err) {
      console.error('Error cancelling order:', err)
      toast.error(err.response?.data?.message || '❌ Lỗi khi hủy đơn hàng')
    } finally {
      setCancelling(false)
    }
  }

  const handleSubmitComment = async (e) => {
    e.preventDefault()

    if (!isDelivered) {
      toast.warn('Chỉ đánh giá được khi đơn đã giao thành công.')
      return
    }

    if (!comment.trim()) {
      toast.warn('Vui lòng nhập nội dung bình luận.')
      return
    }

    setSubmittingComment(true)
    try {
      const firstItem = order?.items?.[0]
      await ClientAxios.post('/api/comments', {
        food_id: firstItem?.foodId || null,
        mon_an: firstItem?.name ? `${firstItem.name} (Đơn #${getOrderCode(order)})` : `Đơn #${getOrderCode(order)}`,
        content: comment.trim(),
        rating
      })

      setComment('')
      setRating(5)
      setCommentSent(true)
      toast.success('Đã gửi đánh giá. Admin sẽ duyệt và hiển thị sau.')
    } catch (err) {
      console.error('Error submitting comment:', err)
      toast.error(err.response?.data?.message || 'Gửi đánh giá thất bại.')
    } finally {
      setSubmittingComment(false)
    }
  }

  return (
    <div style={{ padding: '40px 20px', minHeight: '100vh', backgroundColor: '#f0f2f5', fontFamily: 'Arial' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        <Link to="/orders" style={{ color: '#747d8c', textDecoration: 'none', fontSize: '14px' }}>← Quay lại Đơn hàng</Link>

        {/* Order Tracking with Map - Only show if order has proper data */}
        {order && (
          <div style={{ marginTop: '20px', backgroundColor: 'white', borderRadius: '20px', padding: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
            <OrderTracking order={order} />
          </div>
        )}

        {/* Classic Order Details */}
        <div style={{ marginTop: '30px', backgroundColor: 'white', borderRadius: '20px', padding: '30px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
          <h2 style={{ margin: '0 0 12px', color: '#2f3542' }}>Chi tiết đơn hàng #{getOrderCode(order)}</h2>
          <p style={{ margin: '0 0 6px', color: '#57606f' }}>Ngày đặt: {order?.createdAt ? new Date(order.createdAt).toLocaleString() : 'N/A'}</p>
          <p style={{ margin: '0 0 20px', color: '#2f3542', fontWeight: 'bold' }}>Trạng thái: {getOrderStatusLabel(order?.status)}</p>

          <div style={{ display: 'grid', gap: '18px', marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
              <div>
                <p style={{ margin: '0 0 6px', color: '#57606f' }}>Tên khách hàng</p>
                <p style={{ margin: 0, color: '#2f3542' }}>{getCustomerName(order)}</p>
              </div>
              <div>
                <p style={{ margin: '0 0 6px', color: '#57606f' }}>Số điện thoại</p>
                <p style={{ margin: 0, color: '#2f3542' }}>{order?.phone || 'N/A'}</p>
              </div>
            </div>

            <div>
              <p style={{ margin: '0 0 6px', color: '#57606f' }}>Địa chỉ giao</p>
              <p style={{ margin: 0, color: '#2f3542' }}>{order?.address || 'N/A'}</p>
            </div>

            {order?.customerEmail && (
              <div>
                <p style={{ margin: '0 0 6px', color: '#57606f' }}>Email liên hệ</p>
                <p style={{ margin: 0, color: '#2f3542' }}>{order.customerEmail}</p>
              </div>
            )}
          </div>

          <div style={{ borderTop: '1px solid #f1f2f6', paddingTop: '20px' }}>
            <h3 style={{ margin: '0 0 12px', color: '#2f3542' }}>Món đã đặt</h3>
            <div style={{ display: 'grid', gap: '12px' }}>
              {order?.items && order.items.length > 0 ? (
                order.items.map((item, idx) => (
                  <div key={item.foodId || item._id || idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', backgroundColor: '#f7f9fb', borderRadius: '16px' }}>
                    <div>
                      <Link to={`/food/${item.foodId}`} style={{ textDecoration: 'none', color: '#2f3542' }}>
                        <p style={{ margin: '0 0 6px', color: '#2f3542', fontWeight: 'bold' }}>{item.name || 'Món không tên'}</p>
                      </Link>
                      <p style={{ margin: 0, color: '#57606f' }}>Số lượng: {item.quantity || 0}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ margin: '0 0 6px', color: '#57606f' }}>Giá mỗi món</p>
                      <p style={{ margin: 0, color: '#2f3542', fontWeight: 'bold' }}>{(item.price || 0).toLocaleString()} VNĐ</p>
                      <p style={{ margin: '6px 0 0', color: '#2f3542' }}>{((item.price || 0) * (item.quantity || 0)).toLocaleString()} VNĐ</p>
                    </div>
                  </div>
                ))
              ) : (
                <p style={{ color: '#999', textAlign: 'center' }}>Không có món nào trong đơn hàng</p>
              )}
            </div>

            <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <p style={{ margin: '0 0 8px', color: '#57606f' }}>Tổng giá trị đơn</p>
                <p style={{ margin: 0, fontSize: '24px', color: '#ff4757', fontWeight: 'bold' }}>{getOrderTotal(order).toLocaleString()} VNĐ</p>
              </div>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <button
                  onClick={handleCancelOrder}
                  disabled={cancelling || !allowCancel}
                  style={{
                    padding: '12px 22px',
                    backgroundColor: !allowCancel ? '#ddd' : '#ff4757',
                    color: '#ffffff',
                    borderRadius: '14px',
                    border: 'none',
                    fontWeight: 'bold',
                    cursor: !allowCancel ? 'not-allowed' : 'pointer',
                    fontSize: '14px',
                    transition: 'all 0.3s'
                  }}
                  onMouseOver={(e) => {
                    if (allowCancel) {
                      e.target.style.backgroundColor = '#ff3838'
                    }
                  }}
                  onMouseOut={(e) => {
                    if (allowCancel) {
                      e.target.style.backgroundColor = '#ff4757'
                    }
                  }}
                >
                  {cancelling ? '⏳ Đang hủy...' : '🚫 Hủy Đơn'}
                </button>
                <Link to="/orders" style={{ padding: '12px 22px', backgroundColor: '#3742fa', color: '#ffffff', borderRadius: '14px', textDecoration: 'none', fontWeight: 'bold' }}>
                  Quay lại Đơn hàng
                </Link>
              </div>
            </div>

            {isDelivered && (
              <div style={{ marginTop: '26px', borderTop: '1px solid #f1f2f6', paddingTop: '20px' }}>
                <h3 style={{ margin: '0 0 12px', color: '#2f3542' }}>⭐ Đánh giá & bình luận</h3>
                {commentSent ? (
                  <p style={{ margin: 0, color: '#16a34a', fontWeight: '600' }}>
                    Cảm ơn bạn đã đánh giá. Bình luận đang chờ admin duyệt.
                  </p>
                ) : (
                  <form onSubmit={handleSubmitComment} style={{ display: 'grid', gap: '10px' }}>
                    <div>
                      <label htmlFor="rating" style={{ display: 'block', marginBottom: '6px', color: '#57606f' }}>Số sao</label>
                      <select
                        id="rating"
                        value={rating}
                        onChange={(e) => setRating(Number(e.target.value))}
                        style={{ padding: '10px 12px', borderRadius: '12px', border: '1px solid #dcdde1' }}
                      >
                        <option value={5}>5 sao - Rất tốt</option>
                        <option value={4}>4 sao - Tốt</option>
                        <option value={3}>3 sao - Ổn</option>
                        <option value={2}>2 sao - Chưa tốt</option>
                        <option value={1}>1 sao - Không hài lòng</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="comment" style={{ display: 'block', marginBottom: '6px', color: '#57606f' }}>Bình luận</label>
                      <textarea
                        id="comment"
                        rows={4}
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Chia sẻ trải nghiệm của bạn về đơn hàng này..."
                        style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', border: '1px solid #dcdde1', resize: 'vertical' }}
                      />
                    </div>

                    <div>
                      <button
                        type="submit"
                        disabled={submittingComment}
                        style={{ padding: '12px 18px', borderRadius: '12px', border: 'none', backgroundColor: '#00b894', color: '#fff', fontWeight: '700', cursor: submittingComment ? 'not-allowed' : 'pointer' }}
                      >
                        {submittingComment ? 'Đang gửi...' : 'Gửi đánh giá'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default OrderDetail



