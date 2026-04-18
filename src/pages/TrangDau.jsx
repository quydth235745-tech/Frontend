import React from 'react'
import { Link } from 'react-router-dom'
import './TrangDau.css'

function Landing() {
    return (
        <div className="landing-container">
            {/* Hero Section */}
            <section className="hero">
                <div className="hero-content">
                    <h1 className="hero-title">🍕 Thức Ăn Ngon Lành</h1>
                    <p className="hero-subtitle">Chúng tôi mang đến cho bạn những món ăn tuyệt vời nhất</p>
                    <div className="hero-buttons">
                        <Link to="/menu" className="btn btn-primary">
                            🛍️ Xem Menu Ngay
                        </Link>
                        <a href="#features" className="btn btn-secondary">
                            📖 Tìm Hiểu Thêm
                        </a>
                    </div>
                </div>
                <div className="hero-image">
                    <div className="hero-emoji">🍔🍕🍜</div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="features">
                <h2>Tại Sao Chọn Chúng Tôi?</h2>
                <div className="features-grid">
                    <div className="feature-card">
                        <div className="feature-icon">🚀</div>
                        <h3>Nhanh Chóng</h3>
                        <p>Giao hàng nhanh trong vòng 30 phút</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">👨‍🍳</div>
                        <h3>Chất Lượng</h3>
                        <p>Đầu bếp giỏi nấu ăn tươi mỗi ngày</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">💰</div>
                        <h3>Giá Hợp Lý</h3>
                        <p>Các mức giá cực kỳ rẻ và cạnh tranh</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">⭐</div>
                        <h3>Hài Lòng 100%</h3>
                        <p>Khách hàng luôn yêu thích sản phẩm</p>
                    </div>
                </div>
            </section>

            {/* Popular Items Section */}
            <section className="popular">
                <h2>Món Ăn Phổ Biến</h2>
                <div className="popular-grid">
                    <div className="popular-card">
                        <div className="popular-icon">🍕</div>
                        <h3>Pizza</h3>
                        <p>Bánh pizza nóng hổi với phô mai tươi</p>
                    </div>
                    <div className="popular-card">
                        <div className="popular-icon">🍔</div>
                        <h3>Burger</h3>
                        <p>Burger lớn, thơm ngon, đầy đủ toppings</p>
                    </div>
                    <div className="popular-card">
                        <div className="popular-icon">🍜</div>
                        <h3>Mì Ý</h3>
                        <p>Mì Ý chính thống với nước sốt cà chua</p>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="cta">
                <h2>Bạn Đã Sẵn Sàng Chưa?</h2>
                <p>Hãy khám phá những món ăn tuyệt vời của chúng tôi ngay bây giờ!</p>
                <Link to="/menu" className="btn btn-primary btn-large">
                    🛒 Đi Mua Ngay
                </Link>
            </section>

            {/* Footer */}
            <footer className="footer">
                <div className="footer-content">
                    <div className="footer-section">
                        <h4>📱 Liên Hệ</h4>
                        <p>Email: nphuquy260@gmail.com</p>
                        <p>Điện thoại: 0354504037</p>
                    </div>
                    <div className="footer-section">
                        <h4>📍 Địa Chỉ</h4>
                        <p>Số Nhà 115, Ấp Bình An,  xã Châu Phú, Tỉnh An Giang</p>
                        <p>Giờ mở cửa: 7:00 - 22:00</p>
                    </div>
                    <div className="footer-section">
                        <h4>🌐 Theo Dõi</h4>
                        <p>Facebook | Instagram | Twitter</p>
                    </div>
                </div>
                <div className="footer-bottom">
                    <p>&copy; 2026 Food Order. Tất cả quyền được bảo lưu.</p>
                </div>
            </footer>
        </div>
    )
}

export default Landing
