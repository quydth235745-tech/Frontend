import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import styles from '../styles/OrderSuccess.module.css';

const OrderSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [order, setOrder] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Get order data from location state
    const orderData = location.state?.order;
    
    if (!orderData) {
      // Redirect to home if no order data
      navigate('/');
      return;
    }

    setOrder(orderData);
  }, [location, navigate]);

  const handleCopyOrderId = () => {
    if (order?.id) {
      navigator.clipboard.writeText(order.id);
      setCopied(true);
      toast.success('Đã sao chép mã đơn hàng!');
      
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleTrackOrder = () => {
    navigate('/orders', { state: { trackOrderId: order?.id } });
  };

  const handleContinueShopping = () => {
    navigate('/');
  };

  if (!order) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
      </div>
    );
  }

  // Calculate delivery time (30-45 minutes from now)
  const deliveryTime = new Date(new Date().getTime() + 35 * 60000);
  const deliveryTimeString = deliveryTime.toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        {/* Success Icon */}
        <div className={styles.successIcon}>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        </div>

        {/* Main Message */}
        <h1 className={styles.title}>Đặt hàng thành công!</h1>
        <p className={styles.subtitle}>
          Cảm ơn bạn đã đặt hàng. Đơn hàng của bạn đã được xác nhận và sẽ sớm được chuẩn bị.
        </p>

        {/* Order Summary */}
        <div className={styles.orderInfo}>
          <div className={styles.infoRow}>
            <span className={styles.label}>Mã đơn hàng:</span>
            <div className={styles.orderIdContainer}>
              <span className={styles.value}>{order.id}</span>
              <button className={styles.copyButton} onClick={handleCopyOrderId}>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                  <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
                </svg>
                {copied ? 'Đã sao chép!' : 'Sao chép'}
              </button>
            </div>
          </div>

          <div className={styles.infoRow}>
            <span className={styles.label}>Tổng cộng:</span>
            <span className={styles.totalValue}>
              {new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND',
              }).format(order.total || 0)}
            </span>
          </div>

          <div className={styles.infoRow}>
            <span className={styles.label}>Địa chỉ giao hàng:</span>
            <span className={styles.value}>{order.address}</span>
          </div>

          <div className={styles.infoRow}>
            <span className={styles.label}>Thời gian giao dự kiến:</span>
            <span className={styles.value}>{deliveryTimeString}</span>
          </div>

          {order.notes && (
            <div className={styles.infoRow}>
              <span className={styles.label}>Ghi chú:</span>
              <span className={styles.value}>{order.notes}</span>
            </div>
          )}
        </div>

        {/* Items List */}
        {order.items && order.items.length > 0 && (
          <div className={styles.itemsList}>
            <h3 className={styles.itemsTitle}>Chi tiết đơn hàng:</h3>
            <div className={styles.itemsContainer}>
              {order.items.map((item, index) => (
                <div key={index} className={styles.item}>
                  <span className={styles.itemName}>
                    {item.name} x {item.quantity}
                  </span>
                  <span className={styles.itemPrice}>
                    {new Intl.NumberFormat('vi-VN', {
                      style: 'currency',
                      currency: 'VND',
                    }).format(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Information Box */}
        <div className={styles.infoBox}>
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
          <div>
            <p className={styles.infoBoxTitle}>Bạn sẽ nhận được thông báo</p>
            <p className={styles.infoBoxText}>
              Mã xác nhận đã được gửi đến email của bạn. Bạn sẽ nhận được cập nhật về đơn hàng sớm.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className={styles.actions}>
          <button className={styles.primaryButton} onClick={handleTrackOrder}>
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            Theo dõi đơn hàng
          </button>
          <button className={styles.secondaryButton} onClick={handleContinueShopping}>
            Tiếp tục mua sắm
          </button>
        </div>

        {/* Contact Support */}
        <div className={styles.supportBox}>
          <p>Cần trợ giúp? </p>
          <a href="mailto:support@foodorder.com">Liên hệ hỗ trợ</a>
          {' | '}
          <a href="tel:+841234567890">Gọi: 123-456-7890</a>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;
