import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import ClientAxios from '../../api/ClientAxios';
import AdminTopBar from '../../components/AdminTopBar';
import {
  getCustomerName,
  getOrderCode,
  getOrderId,
  getOrderStatusLabel,
  getOrderTotal,
  getPaymentMethod,
  normalizeOrderStatus
} from '../../utils/orderMapper';
import styles from './ThanhToan.module.css';

export default function ThanhToan() {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const actionableOrders = useMemo(() => {
    return orders.filter((order) => {
      const normalized = normalizeOrderStatus(order.status);
      return normalized !== 'cancelled';
    });
  }, [orders]);

  const fetchOrders = useCallback(async (silent = false) => {
    try {
      if (!silent) {
        setLoading(true);
      }
      const response = await ClientAxios.get('/api/orders');
      setOrders(response.data.data || response.data || []);
    } catch (error) {
      console.error('Lỗi tải danh sách:', error);
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    fetchOrders();

    const intervalId = setInterval(() => {
      fetchOrders(true);
    }, 8000);

    const handleFocus = () => fetchOrders(true);
    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener('focus', handleFocus);
    };
  }, [fetchOrders]);

  useEffect(() => {
    const orderIdFromQuery = searchParams.get('orderId');
    if (!orderIdFromQuery || actionableOrders.length === 0) return;

    const foundOrder = actionableOrders.find((order) => getOrderId(order) === orderIdFromQuery);
    if (foundOrder) {
      setSelectedOrder(foundOrder);
    }
  }, [actionableOrders, searchParams]);

  const handleConfirmPayment = async (orderId) => {
    try {
      await ClientAxios.patch(`/api/orders/${orderId}/status`, { status: 'confirmed' });
      alert('Xác nhận thanh toán thành công!');
      navigate(`/admin/inhoadon/${orderId}`);
      setSelectedOrder(null);
      fetchOrders(true);
    } catch (error) {
      console.error('Lỗi xác nhận:', error);
      alert('Xác nhận thất bại!');
    }
  };

  const handlePrintInvoice = (orderId) => {
    navigate(`/admin/inhoadon/${orderId}`);
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

  if (selectedOrder) {
    const orderId = getOrderId(selectedOrder);
    const status = normalizeOrderStatus(selectedOrder.status);
    const isPending = status === 'pending';

    return (
      <div className={styles.fullPage}>
        <AdminTopBar activeKey="thanhtoan" />
        <div className={styles.content}>
          <div className={styles.container}>
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h2>XÁC NHẬN THANH TOÁN ĐƠN #{getOrderCode(selectedOrder)}</h2>
              </div>
              <div className={styles.cardBody}>
                <div className={styles.leftContent}>
                  <p>
                    Khách hàng: <b>{getCustomerName(selectedOrder)}</b>
                  </p>
                  <p>
                    Phương thức:{' '}
                    <span className={styles.badge}>
                      {getPaymentMethod(selectedOrder)}
                    </span>
                  </p>
                  <h1 className={styles.totalAmount}>
                    {formatMoney(getOrderTotal(selectedOrder))}
                  </h1>
                </div>
                <div className={styles.rightContent}>
                  <p className={styles.note}>
                    Vui lòng xác nhận đã nhận đủ tiền trước khi in hóa đơn cho khách.
                  </p>
                  <button
                    className={styles.btnConfirm}
                    onClick={() => {
                      if (isPending) {
                        handleConfirmPayment(orderId);
                        return;
                      }
                      handlePrintInvoice(orderId);
                    }}
                  >
                    {isPending ? 'XÁC NHẬN & IN HÓA ĐƠN' : 'IN HÓA ĐƠN'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.fullPage}>
      <AdminTopBar activeKey="thanhtoan" />

      {/* Content */}
      <div className={styles.content}>
        <table className={styles.table}>
        <thead>
          <tr>
            <th>MÃ ĐƠN</th>
            <th>KHÁCH HÀNG</th>
            <th>TỔNG TIỀN</th>
            <th>TRẠNG THÁI</th>
            <th>PHƯƠNG THỨC</th>
            <th style={{ textAlign: 'center' }}>THAO TÁC</th>
          </tr>
        </thead>
        <tbody>
          {actionableOrders.length === 0 ? (
            <tr>
              <td colSpan="6" className={styles.noData}>
                Không có đơn hàng cần xử lý thanh toán
              </td>
            </tr>
          ) : (
            actionableOrders.map(order => {
              const normalizedStatus = normalizeOrderStatus(order.status);
              const isPending = normalizedStatus === 'pending';

              return (
              <tr key={getOrderId(order)}>
                <td>
                  <b>#{getOrderCode(order)}</b>
                </td>
                <td>
                  <b>{getCustomerName(order)}</b>
                </td>
                <td>
                  <b className={styles.giaTien}>
                    {formatMoney(getOrderTotal(order))}
                  </b>
                </td>
                <td>{getOrderStatusLabel(order.status)}</td>
                <td>{getPaymentMethod(order)}</td>
                <td style={{ textAlign: 'center' }}>
                  <button
                    className={styles.btnProcess}
                    onClick={() => {
                      if (isPending) {
                        setSelectedOrder(order);
                        return;
                      }
                      handlePrintInvoice(getOrderId(order));
                    }}
                  >
                    {isPending ? 'XỬ LÝ' : 'IN HÓA ĐƠN'}
                  </button>
                </td>
              </tr>
            );
            })
          )}
        </tbody>
      </table>
      </div>
    </div>
  );
}


