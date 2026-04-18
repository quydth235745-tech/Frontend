import React, { useContext, useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import ClientAxios from '../api/ClientAxios'
import { toast } from 'react-toastify' // ✨ Thêm thông báo xịn
import { AuthContext } from '../context/ContextXacThuc'

function FoodDetail() {
  const { id } = useParams()
  const [food, setFood] = useState(null)
  const [qty, setQty] = useState(1) // ✨ State lưu số lượng khách chọn
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [submittingReview, setSubmittingReview] = useState(false)
  const navigate = useNavigate()
  const { user } = useContext(AuthContext)

  useEffect(() => {
    ClientAxios.get(`/api/foods/${id}`)
      .then(res => setFood(res.data.data || res.data))
      .catch(err => {
        console.log(err)
        toast.error("Không tìm thấy món này ní ơi!")
      })
  }, [id])

  const averageRating = food?.reviews?.length
    ? (food.reviews.reduce((sum, review) => sum + review.rating, 0) / food.reviews.length).toFixed(1)
    : null

  const handleSubmitReview = async (e) => {
    e.preventDefault()
    if (!user) {
      toast.warn('Bạn phải đăng nhập mới được đánh giá.')
      return
    }
    if (!comment.trim()) {
      toast.warn('Mời bạn nhập bình luận trước nhé.')
      return
    }

    setSubmittingReview(true)
    try {
      const res = await ClientAxios.post(`/api/foods/${id}/reviews`, { rating, comment })
      setFood(res.data.data || res.data)
      setComment('')
      setRating(5)
      toast.success('Cảm ơn bạn đã gửi đánh giá!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gửi đánh giá thất bại.')
    } finally {
      setSubmittingReview(false)
    }
  }

  // ✨ Hàm xử lý bỏ món vào giỏ
  const handleAddToCart = () => {
    const currentCart = JSON.parse(localStorage.getItem('cart')) || []
    
    // Tạo bản sao của món ăn và thêm thuộc tính số lượng
    const itemToAdd = { ...food, quantity: qty }

    let newCart = [...currentCart]
    const index = newCart.findIndex(item => item._id === food._id)

    if (index > -1) {
      // Nếu món đã có trong giỏ, cộng dồn số lượng
      newCart[index].quantity += qty
    } else {
      // Nếu chưa có, thêm mới vào mảng
      newCart.push(itemToAdd)
    }

    localStorage.setItem('cart', JSON.stringify(newCart))
    toast.success(`Đã thêm ${qty} ${food.name} vào giỏ hàng! 🛒`)
  }

  if (!food) return <div style={{ textAlign: 'center', marginTop: '50px' }}>⏳ Đang tải món ngon...</div>

  return (
    <div style={{ padding: '40px', maxWidth: '1000px', margin: '0 auto', fontFamily: 'Arial' }}>
      <button 
        onClick={() => navigate(-1)} 
        style={{ marginBottom: '30px', padding: '10px 20px', cursor: 'pointer', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: 'white' }}
      >
        ⬅ Quay lại Menu
      </button>

      <div style={{ display: 'flex', gap: '50px', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
        {/* Hình ảnh món ăn */}
        <img 
          src={food.image} 
          alt={food.name} 
          style={{ width: '450px', height: '400px', borderRadius: '25px', boxShadow: '0 15px 35px rgba(0,0,0,0.15)', objectFit: 'cover' }} 
        />
        
        {/* Thông tin chi tiết */}
        <div style={{ flex: 1, textAlign: 'left', maxWidth: '450px' }}>
          <span style={{ backgroundColor: '#fff3cd', color: '#856404', padding: '5px 15px', borderRadius: '20px', fontSize: '14px', fontWeight: 'bold' }}>
            {food.category}
          </span>
          
          <h1 style={{ color: '#2f3542', fontSize: '36px', margin: '15px 0' }}>{food.name}</h1>
          
          <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#ff4757', marginBottom: '20px' }}>
            {food.price.toLocaleString()} VNĐ
          </p>
          
          <p style={{ color: '#57606f', lineHeight: '1.8', marginBottom: '15px', fontSize: '16px' }}>
            {food.description}
          </p>
          {food.promotion && (
            <div style={{ marginBottom: '20px', padding: '15px', borderRadius: '18px', backgroundColor: '#e7f5ff', color: '#2d6cdf', fontWeight: '700' }}>
              🎉 Khuyến mãi: {food.promotion}
            </div>
          )}
          {(food.reviews?.length ?? 0) > 0 && (
            <div style={{ marginBottom: '20px', padding: '16px', borderRadius: '18px', backgroundColor: '#f7f7f7' }}>
              <strong style={{ fontSize: '16px' }}>Điểm đánh giá:</strong>
              <span style={{ marginLeft: '10px', color: '#ffb142', fontWeight: '700' }}>{averageRating} / 5</span>
              <span style={{ marginLeft: '10px', color: '#57606f' }}>({food.reviews.length} nhận xét)</span>
            </div>
          )}

          <hr style={{ border: '0.5px solid #eee', marginBottom: '30px' }} />

          {/* ✨ BỘ CHỌN SỐ LƯỢNG */}
          {user?.role !== 'admin' ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '30px' }}>
                <span style={{ fontWeight: 'bold' }}>Số lượng:</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', backgroundColor: '#f1f2f6', borderRadius: '30px', padding: '5px 15px' }}>
                  <button 
                    onClick={() => setQty(Math.max(1, qty - 1))} 
                    style={{ width: '35px', height: '35px', borderRadius: '50%', border: 'none', backgroundColor: 'white', cursor: 'pointer', fontSize: '20px', fontWeight: 'bold', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}
                  >- </button>
                  <span style={{ fontSize: '18px', fontWeight: 'bold', minWidth: '20px', textAlign: 'center' }}>{qty}</span>
                  <button 
                    onClick={() => setQty(qty + 1)} 
                    style={{ width: '35px', height: '35px', borderRadius: '50%', backgroundColor: '#ff4757', color: 'white', border: 'none', cursor: 'pointer', fontSize: '20px', fontWeight: 'bold', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}
                  >+</button>
                </div>
              </div>

              <button 
                onClick={handleAddToCart}
                style={{ width: '100%', padding: '18px', backgroundColor: '#ff4757', color: 'white', border: 'none', borderRadius: '15px', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 8px 20px rgba(255, 71, 87, 0.3)', transition: '0.3s' }}
              >
                Bỏ vào giỏ hàng ngay
              </button>
            </>
          ) : (
            <div style={{ margin: '30px 0', padding: '18px', borderRadius: '18px', backgroundColor: '#e7f5ff', color: '#2d6cdf', fontWeight: '700', fontSize: '16px', textAlign: 'center' }}>
              Xem Chi Tiết Món Ăn
            </div>
          )}

          <div style={{ marginTop: '32px', padding: '24px', backgroundColor: '#ffffff', borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
            <h3 style={{ marginTop: 0, color: '#2f3542' }}>Đánh giá & bình luận</h3>
            {user ? (
              <form onSubmit={handleSubmitReview} style={{ display: 'grid', gap: '16px', marginTop: '18px' }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <label style={{ fontWeight: '700' }}>Điểm:</label>
                  <select value={rating} onChange={(e) => setRating(Number(e.target.value))} style={{ padding: '10px 14px', borderRadius: '12px', border: '1px solid #dcdde1' }}>
                    {[5,4,3,2,1].map(value => (
                      <option key={value} value={value}>{value} sao</option>
                    ))}
                  </select>
                </div>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Viết nhận xét của bạn..."
                  rows={4}
                  style={{ width: '100%', padding: '14px', borderRadius: '14px', border: '1px solid #dcdde1', resize: 'vertical' }}
                />
                <button type="submit" disabled={submittingReview} style={{ padding: '14px 18px', borderRadius: '14px', border: 'none', backgroundColor: '#00d2d3', color: 'white', cursor: 'pointer', fontWeight: '700' }}>
                  {submittingReview ? 'Đang gửi...' : 'Gửi đánh giá'}
                </button>
              </form>
            ) : (
              <p style={{ marginTop: '18px', color: '#57606f' }}>Bạn hãy đăng nhập để đánh giá và bình luận món ăn này.</p>
            )}

            <div style={{ marginTop: '24px' }}>
              <h4 style={{ margin: '0 0 16px', color: '#2f3542' }}>Nhận xét từ khách hàng</h4>
              {food.reviews?.length ? (
                <div style={{ display: 'grid', gap: '18px' }}>
                  {food.reviews.slice().reverse().map(review => (
                    <div key={review._id || review.createdAt} style={{ padding: '18px', borderRadius: '18px', backgroundColor: '#f7f9fc', border: '1px solid #edf2f7' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
                        <div>
                          <strong>{review.userName}</strong>
                          <span style={{ marginLeft: '10px', color: '#ffd43b' }}>⭐ {review.rating}</span>
                        </div>
                        <span style={{ color: '#57606f' }}>{new Date(review.createdAt).toLocaleDateString('vi-VN')}</span>
                      </div>
                      <p style={{ marginTop: '12px', color: '#2f3542', lineHeight: '1.7' }}>{review.comment}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: '#57606f', marginTop: '12px' }}>Chưa có bình luận nào. Hãy là người đầu tiên đánh giá nhé!</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FoodDetail


