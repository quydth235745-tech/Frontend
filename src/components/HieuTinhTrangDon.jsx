import React from 'react';
import './OrderStatusBadge.css';

/**
 * Order Status Badge Component
 * Displays order status with consistent styling
 * Converts English status to Vietnamese display
 */
const OrderStatusBadge = ({ status, size = 'medium' }) => {
  // Status mapping English -> Vietnamese
  const statusMap = {
    pending: 'Đang xử lý',
    confirmed: 'Đã xác nhận',
    preparing: 'Đang chuẩn bị',
    ready: 'Sẵn sàng',
    shipping: 'Đang giao',
    delivered: 'Đã giao',
    cancelled: 'Đã hủy',
  };

  // Status to color mapping
  const statusColors = {
    pending: '#fdcb6e', // Yellow
    confirmed: '#74b9ff', // Light blue
    preparing: '#a29bfe', // Purple
    ready: '#55efc4', // Light green
    shipping: '#fab1a0', // Light orange
    delivered: '#00b894', // Green
    cancelled: '#d63031', // Red
  };

  const displayStatus = statusMap[status] || status;
  const bgColor = statusColors[status] || '#95a5a6';

  return (
    <span
      className={`order-status-badge order-status-${status} size-${size}`}
      style={{ backgroundColor: bgColor }}
      title={`Status: ${displayStatus}`}
    >
      {displayStatus}
    </span>
  );
};

/**
 * Order Status Box - Larger version for detail pages
 */
export const OrderStatusBox = ({ status, timestamp }) => {
  const statusMap = {
    pending: 'Đang xử lý',
    confirmed: 'Đã xác nhận',
    preparing: 'Đang chuẩn bị',
    ready: 'Sẵn sàng',
    shipping: 'Đang giao',
    delivered: 'Đã giao',
    cancelled: 'Đã hủy',
  };

  const statusEmojis = {
    pending: '⏳',
    confirmed: '✅',
    preparing: '👨‍🍳',
    ready: '🎉',
    shipping: '🚚',
    delivered: '📦',
    cancelled: '❌',
  };

  return (
    <div className="order-status-box">
      <div className="status-emoji">{statusEmojis[status] || '📋'}</div>
      <div className="status-content">
        <div className="status-name">{statusMap[status]}</div>
        {timestamp && (
          <div className="status-time">
            {new Date(timestamp).toLocaleString('vi-VN')}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderStatusBadge;
