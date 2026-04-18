import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import ClientAxios from '../../api/ClientAxios';
import AdminTopBar from '../../components/AdminTopBar';
import {
  getCustomerName,
  getOrderCode,
  getOrderDate,
  getOrderStatusLabel,
  getOrderTotal,
  getShippingFee,
  normalizeOrderStatus
} from '../../utils/orderMapper';
import styles from './DonHang.module.css';

export default function DonHangChiTiet() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchOrderDetails();
  }, [id]);

  const getItemsTotal = (orderData) => {
    const itemsList = orderData?.items || [];
    return itemsList.reduce((sum, item) => {
      const qty = Number(item.quantity ?? item.so_luong ?? 0);
      const price = Number(item.price ?? item.gia_ban ?? 0);
      return sum + qty * price;
    }, 0);
  };

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const orderRes = await ClientAxios.get(`/api/orders/${id}`);
      const orderData = orderRes.data.data || orderRes.data;
      setOrder(orderData);
      setItems(orderData.items || []);
    } catch (err) {
      console.error('Lỗi tải chi tiết đơn hàng:', err);
      setError('Không tìm thấy đơn hàng!');
    } finally {
      setLoading(false);
    }
  };

  const formatMoney = (num) => {
    const safeNumber = Number.isFinite(num) ? num : 0;
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(safeNumber);
  };

  if (loading) {
    return <div className={styles.loading}>Đang tải...</div>;
  }

  if (error || !order) {
    return <div className={styles.error}>{error || 'Không tìm thấy đơn hàng'}</div>;
  }

  return (
    <div className={styles.fullPage}>
      <AdminTopBar activeKey="donhang" />
      <div className={styles.content}>
        <div className={styles.container}>
          <div className={styles.header}>
            <h2>📄 Chi Tiết Đơn Hàng #{getOrderCode(order)}</h2>
            <Link to="/admin/donhang" className={styles.btnBack}>
              ⬅ Quay lại
            </Link>
          </div>

          <div className={styles.orderInfo}>
            <div>
              <p>Khách hàng:</p>
              <h3>{getCustomerName(order)}</h3>
            </div>
            <div>
              <p>Thời gian đặt:</p>
              <h3>
                {getOrderDate(order) ? new Date(getOrderDate(order)).toLocaleString('vi-VN') : 'N/A'}
              </h3>
            </div>
            <div>
              <p>Trạng thái:</p>
              <span className={styles.badge}>
                {getOrderStatusLabel(normalizeOrderStatus(order.status || order.trang_thai))}
              </span>
            </div>
          </div>

          <div className={styles.itemsSection}>
            <h3>Danh sách món ăn</h3>
            <table className={styles.itemsTable}>
              <thead>
                <tr>
                  <th>STT</th>
                  <th>Tên Món Ăn</th>
                  <th>Đơn Giá</th>
                  <th style={{ textAlign: 'center' }}>Số Lượng</th>
                  <th style={{ textAlign: 'right' }}>Thành Tiền</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>
                      Không có chi tiết cho đơn hàng này
                    </td>
                  </tr>
                ) : (
                  items.map((item, idx) => (
                    <tr key={item._id || `${idx}-${item.foodId || 'item'}`}>
                      <td>{idx + 1}</td>
                      <td>
                        <b>{item.name || item.food_name || item.ten_mon}</b>
                      </td>
                      <td>{formatMoney(item.price || item.gia_ban)}</td>
                      <td style={{ textAlign: 'center', fontWeight: 'bold' }}>
                        {item.quantity || item.so_luong}
                      </td>
                      <td style={{ textAlign: 'right', color: '#d84315', fontWeight: 'bold' }}>
                        {formatMoney(
                          (item.quantity || item.so_luong) * (item.price || item.gia_ban)
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className={styles.totalSection}>
            <div>
              <Link to={`/admin/inhoadon/${id}`} className={styles.btnPrint}>
                🖨️ In Hóa Đơn
              </Link>
            </div>
            <div className={styles.totalRight}>
              <span className={styles.totalLabel}>TIỀN MÓN:</span>
              <span className={styles.totalValue}>
                {formatMoney(getItemsTotal(order))}
              </span>
              <span className={styles.totalLabel}>PHÍ SHIP:</span>
              <span className={styles.totalValue}>
                {formatMoney(getShippingFee(order))}
              </span>
              <span className={styles.totalLabel}>TỔNG CỘNG:</span>
              <span className={styles.totalValue}>
                {formatMoney(getOrderTotal(order))}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


