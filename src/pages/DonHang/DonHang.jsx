import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import ClientAxios from '../../api/ClientAxios';
import AdminTopBar from '../../components/AdminTopBar';
import {
  canCancelOrder,
  getCustomerName,
  getOrderCode,
  getOrderDate,
  getOrderId,
  getOrderStatusLabel,
  getOrderStatusVariant,
  getOrderTotal,
  isPendingOrder,
  normalizeOrderStatus
} from '../../utils/orderMapper';
import styles from './DonHang.module.css';

export default function DonHang() {
  const [donHangs, setDonHangs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingOrderId, setUpdatingOrderId] = useState('');
  const navigate = useNavigate();

  const fetchDonHangs = useCallback(async (silent = false) => {
    try {
      if (!silent) {
        setLoading(true);
      }
      const response = await ClientAxios.get('/api/orders');
      setDonHangs(response.data.data || response.data || []);
    } catch (error) {
      console.error('Lỗi tải danh sách đơn hàng:', error);
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    fetchDonHangs();

    const intervalId = setInterval(() => {
      fetchDonHangs(true);
    }, 8000);

    const handleFocus = () => fetchDonHangs(true);
    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener('focus', handleFocus);
    };
  }, [fetchDonHangs]);

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc muốn hủy đơn này?')) {
      try {
        await ClientAxios.patch(`/api/orders/${id}/status`, { status: 'cancelled' });
        fetchDonHangs();
        alert('Hủy đơn hàng thành công!');
      } catch (error) {
        console.error('Lỗi hủy đơn hàng:', error);
        alert('Hủy đơn hàng thất bại!');
      }
    }
  };

  const handleApprove = async (id) => {
    navigate(`/admin/thanhtoan?orderId=${id}`);
  };

  const getNextStatus = (status) => {
    const normalized = normalizeOrderStatus(status);
    const nextByStatus = {
      pending: 'confirmed',
      confirmed: 'preparing',
      preparing: 'ready',
      ready: 'shipping',
      shipping: 'delivered'
    };

    return nextByStatus[normalized] || null;
  };

  const handleAdvanceStatus = async (orderId, currentStatus) => {
    const nextStatus = getNextStatus(currentStatus);
    if (!nextStatus) return;

    try {
      setUpdatingOrderId(orderId);
      await ClientAxios.patch(`/api/orders/${orderId}/status`, { status: nextStatus });
      fetchDonHangs(true);
      alert(`Đã chuyển trạng thái sang: ${getOrderStatusLabel(nextStatus)}`);
    } catch (error) {
      console.error('Lỗi cập nhật trạng thái đơn hàng:', error);
      alert(error?.response?.data?.message || 'Cập nhật trạng thái thất bại!');
    } finally {
      setUpdatingOrderId('');
    }
  };

  const formatMoney = (num) => {
    const safeNumber = Number.isFinite(num) ? num : 0;
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(safeNumber);
  };

  const getStatusBadge = (status) => {
    const normalized = normalizeOrderStatus(status);
    const label = getOrderStatusLabel(normalized);
    const variant = getOrderStatusVariant(normalized);

    if (variant === 'warning') {
      return <span className={styles.badgeWaiting}>{label}</span>;
    }

    if (variant === 'danger') {
      return <span className={styles.badgeDanger}>{label}</span>;
    }

    return <span className={styles.badgeDone}>{label}</span>;
  };

  const canConfirm = (status) => {
    return isPendingOrder(status);
  };

  return (
    <div className={styles.fullPage}>
      <AdminTopBar activeKey="donhang" />

      {/* Content */}
      <div className={styles.content}>
        {loading ? (
          <div className={styles.loading}>Đang tải...</div>
        ) : (
          <table className={styles.table}>
          <thead>
            <tr>
              <th>MÃ ĐƠN</th>
              <th>KHÁCH HÀNG</th>
              <th>NGÀY ĐẶT</th>
              <th>TỔNG TIỀN</th>
              <th>TRẠNG THÁI</th>
              <th style={{ textAlign: 'center' }}>CHI TIẾT</th>
              <th style={{ textAlign: 'center' }}>THAO TÁC</th>
            </tr>
          </thead>
          <tbody>
            {donHangs.length === 0 ? (
              <tr>
                <td colSpan="7" className={styles.noData}>
                  Chưa có đơn hàng nào
                </td>
              </tr>
            ) : (
              donHangs.map((dh) => {
                const orderId = getOrderId(dh);
                const status = dh.status || dh.trang_thai;
                const orderDate = getOrderDate(dh);
                const nextStatus = getNextStatus(status);
                const isUpdating = updatingOrderId === orderId;
                return (
                <tr key={orderId}>
                  <td>
                    <b>#{getOrderCode(dh) || '----'}</b>
                  </td>
                  <td>
                    <b>{getCustomerName(dh)}</b>
                  </td>
                  <td>
                    {orderDate ? new Date(orderDate).toLocaleDateString('vi-VN') : 'N/A'}
                  </td>
                  <td>
                    <b className={styles.giaTien}>
                      {formatMoney(getOrderTotal(dh))}
                    </b>
                  </td>
                  <td>{getStatusBadge(status)}</td>
                  <td style={{ textAlign: 'center' }}>
                    <Link
                      to={`/admin/donhang/${orderId}`}
                      className={styles.btnChiTiet}
                    >
                      Chi tiết
                    </Link>
                  </td>
                  <td style={{ textAlign: 'center' }} className={styles.actions}>
                    {canConfirm(status) && (
                      <button
                        className={styles.btnDone}
                        disabled={isUpdating}
                        onClick={() => handleApprove(orderId)}
                      >
                        Xử lý
                      </button>
                    )}

                    {nextStatus && normalizeOrderStatus(status) !== 'pending' && (
                      <button
                        className={styles.btnDone}
                        disabled={isUpdating}
                        onClick={() => handleAdvanceStatus(orderId, status)}
                      >
                        {isUpdating ? 'Đang cập nhật...' : `Chuyển: ${getOrderStatusLabel(nextStatus)}`}
                      </button>
                    )}

                    {canCancelOrder(status) && (
                    <button
                      className={styles.btnDelete}
                      disabled={isUpdating}
                      onClick={() => handleDelete(orderId)}
                    >
                      Hủy
                    </button>
                    )}
                  </td>
                </tr>
                );
              })
            )}
          </tbody>
        </table>
        )}
      </div>
    </div>
  );
}


