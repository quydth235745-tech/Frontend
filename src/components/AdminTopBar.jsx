import React from 'react';
import styles from './AdminTopBar.module.css';

const tabs = [
  { key: 'dashboard', href: '/admin?tab=dashboard', label: '📊 Dashboard' },
  { key: 'users', href: '/admin?tab=users', label: '👥 Tài Khoản' },
  { key: 'khuyenmai', href: '/admin/khuyenmai', label: '🎁 Khuyến Mãi' },
  { key: 'monan', href: '/admin/monan', label: '🍽️ Thực Đơn' },
  { key: 'orders', href: '/admin?tab=orders', label: '🛒 Đơn Hàng' },
  { key: 'binhluan', href: '/admin/binhluan', label: '💬 Bình Luận' },
  { key: 'thanhtoan', href: '/admin/thanhtoan', label: '💳 Thanh Toán' }
];

export default function AdminTopBar({ activeKey, actions = null }) {
  const tabClass = (key) => (key === activeKey ? `${styles.tab} ${styles.active}` : styles.tab);

  return (
    <div className={styles.bar}>
      <div className={styles.left}>
        <h1 className={styles.title}>⚙ Quản Lý Admin</h1>
        <div className={styles.tabs}>
          {tabs.map((tab) => (
            <a key={tab.key} href={tab.href} className={tabClass(tab.key)}>
              {tab.label}
            </a>
          ))}
        </div>
      </div>
      {actions ? <div className={styles.actions}>{actions}</div> : null}
    </div>
  );
}