import React, { useContext, useEffect, useState } from 'react'
import ClientAxios from '../api/ClientAxios'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import { AuthContext } from '../context/ContextXacThuc'
import './TrangChu.css'

function Home() {
    const { user } = useContext(AuthContext)
    const [foods, setFoods] = useState([])
    const [quantities, setQuantities] = useState({})

    // State quản lý việc Tìm kiếm và Lọc theo loại món
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedCategory, setSelectedCategory] = useState('Tất cả')

    useEffect(() => {
        ClientAxios.get('/api/foods')
            .then(res => setFoods(res.data.data || []))
            .catch(err => console.error("Lỗi khi lấy dữ liệu món ăn:", err))
    }, [user])

    // Thay đổi số lượng món ăn trước khi thêm vào giỏ
    const changeQty = (id, delta) => {
        setQuantities(prev => ({
            ...prev,
            [id]: Math.max(0, (prev[id] || 0) + delta)
        }))
    }

    // Logic lọc danh sách món ăn dựa trên từ khóa tìm kiếm và danh mục đã chọn
    const filteredFoods = foods.filter(food => {
        // 1. Kiểm tra tên món (Tìm kiếm)
        const matchesSearch = food.name.toLowerCase().includes(searchTerm.toLowerCase());

        // 2. Kiểm tra danh mục (Lọc)
        // Chuyển category từ DB về chữ thường, nếu trống thì để chuỗi rỗng
        const foodCat = (food.category || "").trim().toLowerCase();
        // Chuyển category từ nút bấm về chữ thường
        const selectedCat = selectedCategory.trim().toLowerCase();

        const matchesCategory = selectedCategory === 'Tất cả' || foodCat === selectedCat;

        return matchesSearch && matchesCategory;
    });
    // Xử lý thêm tất cả món đã chọn số lượng vào giỏ hàng (localStorage)
    const addAllToCart = () => {
        const currentCart = JSON.parse(localStorage.getItem('cart')) || []
        const selectedItems = foods.filter(f => quantities[f._id] > 0).map(f => ({
            ...f,
            quantity: quantities[f._id]
        }))

        if (selectedItems.length === 0) {
            toast.warn("Vui lòng chọn ít nhất một món ăn trước khi thêm vào giỏ!")
            return
        }

        let newCart = [...currentCart]
        selectedItems.forEach(newItem => {
            const index = newCart.findIndex(item => item._id === newItem._id)
            if (index > -1) {
                newCart[index].quantity += newItem.quantity
            } else {
                newCart.push(newItem)
            }
        })

        localStorage.setItem('cart', JSON.stringify(newCart))
        toast.success(`Đã thêm thành công vào giỏ hàng! 🛒`)
        setQuantities({}) // Reset lại số lượng về 0 sau khi thêm thành công
    }

    const totalSelected = Object.values(quantities).reduce((a, b) => a + b, 0)

    return (
        <div className="home-container">
            {/* DASHBOARD FOR ADMIN */}
            {user?.role === 'admin' && (
                <div style={{ padding: '30px 20px', backgroundColor: '#fff', marginBottom: '30px', borderBottom: '2px solid #f0f0f0' }} />
            )}

            {/* --- THANH SIDEBAR BÊN TRÁI --- */}
            <div className="sidebar">
                <h3>🔍 Tìm kiếm</h3>
                <input
                    type="text"
                    placeholder="Nhập tên món cần tìm..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />

                <h3 style={{ marginBottom: '20px' }}>📂 Danh mục</h3>
                <div className="category-buttons">
                    {['Tất cả', 'Chính', 'Món ăn vặt', 'Nước'].map(cat => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`category-btn ${selectedCategory === cat ? 'active' : ''}`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* --- NỘI DUNG THỰC ĐƠN BÊN PHẢI --- */}
            <div className="content">
                <h1>🍕 THỰC ĐƠN HÔM NAY 🍔</h1>

                {/* Nút "Thêm vào giỏ" cố định khi có món được chọn */}
                {totalSelected > 0 && user?.role !== 'admin' && (
                    <button
                        onClick={addAllToCart}
                        style={{
                            position: 'fixed',
                            bottom: '40px',
                            right: '40px',
                            padding: '18px 40px',
                            backgroundColor: '#2ed573',
                            color: 'white',
                            border: 'none',
                            borderRadius: '50px',
                            fontWeight: 'bold',
                            fontSize: '1.1rem',
                            cursor: 'pointer',
                            boxShadow: '0 10px 25px rgba(46, 213, 115, 0.4)',
                            zIndex: 1000
                        }}
                    >
                        XÁC NHẬN THÊM ({totalSelected} món)
                    </button>
                )}

                <div className="food-grid">
                    {filteredFoods.length > 0 ? filteredFoods.map(item => (
                        <div key={item._id} className="food-card">
                            <Link to={`/food/${item._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                <img src={item.image} alt={item.name} style={{ width: '100%', height: '180px', objectFit: 'cover' }} />
                                <div className="food-card-content">
                                    <h3>{item.name}</h3>
                                    <p>{item.price.toLocaleString()} VNĐ</p>
                                </div>
                            </Link>

                            <div style={{ padding: '0 20px 20px 20px' }}>
                                {user?.role !== 'admin' ? (
                                <div className="quantity-selector">
                                    <button
                                        onClick={() => changeQty(item._id, -1)}
                                        className="quantity-btn"
                                    >-</button>
                                    <span className="quantity-display">
                                        {quantities[item._id] || 0}
                                    </span>
                                    <button
                                        onClick={() => changeQty(item._id, 1)}
                                        className="quantity-btn-plus"
                                    >+</button>
                                </div>
                            ) : (
                                <Link to={`/food/${item._id}`} style={{ textDecoration: 'none' }}>
                                    <button className="detail-btn">Xem Chi Tiết</button>
                                </Link>
                            )}
                        </div>
                    </div>
                )) : (
                        <div className="empty-state">
                            <h3>Rất tiếc, không tìm thấy món ăn bạn yêu cầu!</h3>
                            <p>Vui lòng thử lại với từ khóa khác.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Home


