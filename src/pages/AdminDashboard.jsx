import React from 'react'
import styles from './AdminDashboard.module.css'

function AdminDashboard({ foods, orders, users }) {
  const getOrderTotal = (order) => Number(order?.totalPrice ?? order?.total_price ?? order?.tong_tien ?? 0)
  const totalRevenue = orders.reduce((sum, order) => sum + getOrderTotal(order), 0)

  return (
    <>
      <div className={styles.header}>
        <h1 className={styles.headerTitle}>📊 Bảng Điều Khiển</h1>
        <p className={styles.headerSubtitle}>Tổng quan thông tin kinh doanh</p>
      </div>

      {/* Stats Cards */}
      <div className={styles.statsGrid}>
        <div className={`${styles.statCard} ${styles.food}`}>
          <div className={styles.statIcon}>🍔</div>
          <p className={styles.statLabel}>TỔNG MÓN ĂN</p>
          <p className={`${styles.statValue} ${styles.food}`}>{foods.length}</p>
          <p className={styles.statDescription}>Thực phẩm có sẵn</p>
        </div>

        <div className={`${styles.statCard} ${styles.order}`}>
          <div className={styles.statIcon}>📦</div>
          <p className={styles.statLabel}>TỔNG ĐƠN HÀNG</p>
          <p className={`${styles.statValue} ${styles.order}`}>{orders.length}</p>
          <p className={styles.statDescription}>Đơn hàng được xử lý</p>
        </div>

        <div className={`${styles.statCard} ${styles.user}`}>
          <div className={styles.statIcon}>👥</div>
          <p className={styles.statLabel}>TỔNG TÀI KHOẢN</p>
          <p className={`${styles.statValue} ${styles.user}`}>{users.length}</p>
          <p className={styles.statDescription}>Người dùng đã đăng ký</p>
        </div>

        <div className={`${styles.statCard} ${styles.revenue}`}>
          <div className={styles.statIcon}>💰</div>
          <p className={styles.statLabel}>DOANH THU</p>
          <p className={`${styles.statValue} ${styles.revenue}`}>{totalRevenue.toLocaleString()}</p>
          <p className={styles.statDescription}>VNĐ tổng cộng</p>
        </div>
      </div>

      {/* Charts */}
      <div className={styles.chartsGrid}>
        {/* Revenue Chart */}
        <div className={styles.chartCard}>
          <h3 className={styles.chartTitle}>📈 Doanh Thu Hôm Nay</h3>
          <div className={styles.revenueChart}>
            {['Sáng (6-12)', 'Trưa (12-17)', 'Chiều (17-20)', 'Tối (20-23)'].map((time, idx) => {
              const startHour = [6, 12, 17, 20][idx]
              const endHour = [12, 17, 20, 23][idx]
              const timeOrders = orders.filter(o => {
                const hour = new Date(o.createdAt).getHours()
                return hour >= startHour && hour < endHour
              })
              const amount = timeOrders.reduce((sum, order) => sum + getOrderTotal(order), 0)
              const maxAmount = Math.max(...orders.map(order => getOrderTotal(order)), 1) * 1.2
              const height = Math.max(10, (amount / maxAmount) * 150)
              const barClasses = [styles.bar, styles.bar, styles.bar, styles.bar]
              const barColorClasses = ['', styles.secondary, styles.tertiary, styles.quaternary]

              return (
                <div key={idx} className={styles.barContainer}>
                  <div
                    className={`${barClasses[idx]} ${barColorClasses[idx]}`}
                    style={{ height: `${height}px` }}
                    title={amount.toLocaleString() + ' đ'}
                  />
                  <p className={styles.barLabel}>{time.split(' ')[0]}</p>
                  <p className={styles.barValue}>{(amount / 1000).toFixed(0)}k</p>
                </div>
              )
            })}
          </div>
        </div>

        {/* Distribution Chart */}
        <div className={styles.chartCard}>
          <h3 className={styles.chartTitle}>🥘 Phân Loại Món Ăn</h3>
          <div className={styles.distributionContainer}>
            {['Chính', 'Món ăn vặt', 'Nước'].map((cat, idx) => {
              const count = foods.filter(f => f.category === cat).length
              const percent = foods.length > 0 ? (count / foods.length) * 100 : 0
              const progressClasses = [styles.progress, styles.progress, styles.progress]
              const progressColorClasses = ['', styles.blue, styles.green]

              return (
                <div key={idx}>
                  <div className={styles.distributionRow}>
                    <span className={styles.categoryName}>{cat}</span>
                    <span className={styles.categoryPercent}>{count} ({percent.toFixed(0)}%)</span>
                  </div>
                  <div className={styles.progressBar}>
                    <div
                      className={`${progressClasses[idx]} ${progressColorClasses[idx]}`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </>
  )
}

export default AdminDashboard
