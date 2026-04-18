import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import ClientAxios from '../../api/ClientAxios';
import AdminTopBar from '../../components/AdminTopBar';
import {
  getCustomerName,
  getOrderCode,
  getOrderDate,
  getOrderTotal,
  getPaymentMethod,
  getShippingFee
} from '../../utils/orderMapper';
import styles from './InHoaDon.module.css';

export default function InHoaDon() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [qrLoadError, setQrLoadError] = useState(false);

  const SHOP_NAME = 'Quán Ăn Sáng Long Xuyên';
  const SHOP_TAGLINE = 'Điểm Tâm Sáng - Cà Phê';
  const SHOP_ADDRESS = 'Long Xuyên, An Giang';
  const OWNER_NAME = 'NGUYEN PHU QUY';
  const OWNER_PHONE = '0354504037';

  useEffect(() => {
    fetchInvoice();
  }, [id]);

  const fetchInvoice = async () => {
    try {
      const orderRes = await ClientAxios.get(`/api/orders/${id}`);
      const orderData = orderRes.data.data || orderRes.data;
      setOrder(orderData);
    } catch (error) {
      console.error('Lỗi tải hóa đơn:', error);
      setError(error?.response?.data?.message || 'Không tải được hóa đơn');
    } finally {
      setLoading(false);
    }
  };

  const formatMoney = (value) => {
    const safe = Number(value || 0);
    return new Intl.NumberFormat('vi-VN').format(safe) + ' đ';
  };

  const paymentMethodLabel = (value) => {
    const map = {
      cash: 'Tiền mặt',
      card: 'Thẻ',
      wallet: 'Ví điện tử'
    };
    return map[value] || 'Tiền mặt';
  };

  const receiptData = useMemo(() => {
    const items = order?.items || [];
    const itemsTotal = items.reduce((sum, item) => {
      const qty = Number(item.quantity ?? item.so_luong ?? 0);
      const price = Number(item.price ?? item.gia_ban ?? 0);
      return sum + qty * price;
    }, 0);
    const shippingFee = getShippingFee(order);
    const total = getOrderTotal(order) || itemsTotal + shippingFee;

    return { items, itemsTotal, shippingFee, total };
  }, [order]);

  const qrImageUrl = useMemo(() => {
    const amount = Math.max(0, Math.round(Number(receiptData.total || 0)));
    const billId = getOrderCode(order);
    const addInfo = `Thanh toan Hoa Don ${billId}`;

    return `https://img.vietqr.io/image/MB-0354504037-compact2.png?amount=${encodeURIComponent(String(amount))}&addInfo=${encodeURIComponent(addInfo)}&accountName=${encodeURIComponent(OWNER_NAME)}`;
  }, [order, receiptData.total]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className={styles.fullPage}>
        <div className={styles.loading}>Đang tải hóa đơn...</div>
      </div>
    );
  }

  if (!order || error) {
    return (
      <div className={styles.fullPage}>
        <div className={styles.error}>{error || 'Không tìm thấy hóa đơn'}</div>
      </div>
    );
  }

  return (
    <div className={styles.fullPage}>
      <div className={styles.noPrint}>
        <AdminTopBar activeKey="thanhtoan" />
      </div>
      <div className={styles.content}>
        <div className={`${styles.actionBar} ${styles.noPrint}`}>
          <div className={styles.actionLeft}>
            <h2>Hóa Đơn Đơn #{getOrderCode(order)}</h2>
            <p>Xử lý in trực tiếp trong trình duyệt, không tạo file PDF ngoài web.</p>
          </div>
          <div className={styles.actionButtons}>
            <button className={styles.secondaryBtn} onClick={() => navigate(-1)}>
              Quay lại
            </button>
            <button className={styles.primaryBtn} onClick={handlePrint}>
              In hóa đơn
            </button>
          </div>
        </div>

        <div className={styles.receiptStage}>
          <article className={styles.receipt}>
            <header className={styles.header}>
              <img src="/favicon.svg" alt="logo" className={styles.logo} />
              <h1>{SHOP_NAME}</h1>
              <p className={styles.subtitle}>{SHOP_TAGLINE}</p>
              <p className={styles.metaLine}>ĐC: {SHOP_ADDRESS} | SDT: {OWNER_PHONE}</p>
            </header>

            <section className={styles.metaSection}>
              <div><strong>HD:</strong> #{getOrderCode(order)}</div>
              <div><strong>Ngày:</strong> {getOrderDate(order) ? new Date(getOrderDate(order)).toLocaleString('vi-VN') : 'N/A'}</div>
              <div><strong>Khách:</strong> {getCustomerName(order)}</div>
              <div><strong>PT Thanh toán:</strong> {paymentMethodLabel(getPaymentMethod(order))}</div>
              <div><strong>Địa chỉ:</strong> {order.address || 'N/A'}</div>
            </section>

            <table className={styles.itemsTable}>
              <thead>
                <tr>
                  <th>Món ăn</th>
                  <th className={styles.center}>SL</th>
                  <th className={styles.right}>Thành Tiền</th>
                </tr>
              </thead>
              <tbody>
                {receiptData.items.map((item, idx) => {
                  const qty = Number(item.quantity ?? item.so_luong ?? 0);
                  const price = Number(item.price ?? item.gia_ban ?? 0);
                  const subtotal = qty * price;

                  return (
                    <tr key={item.foodId || item._id || idx}>
                      <td>{item.name || item.food_name || item.ten_mon || 'Món ăn'}</td>
                      <td className={styles.center}>{qty}</td>
                      <td className={styles.right}>{formatMoney(subtotal)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <section className={styles.totalSection}>
              <div className={styles.totalRow}>
                <span>Tiền món:</span>
                <strong>{formatMoney(receiptData.itemsTotal)}</strong>
              </div>
              <div className={styles.totalRow}>
                <span>Phí ship:</span>
                <strong>{formatMoney(receiptData.shippingFee)}</strong>
              </div>
              <div className={styles.grandTotal}>
                <span>Tổng:</span>
                <strong>{formatMoney(receiptData.total)}</strong>
              </div>
            </section>

            <section className={styles.qrSection}>
              <p className={styles.qrTitle}>QR Thanh Toán</p>
              {!qrLoadError ? (
                <img
                  src={qrImageUrl}
                  alt="QR cá nhân"
                  className={styles.qrImage}
                  onError={() => setQrLoadError(true)}
                />
              ) : (
                <div className={styles.qrFallback}>
                  <p>Không tải được ảnh VietQR từ link online.</p>
                  <p>Vui lòng kiểm tra kết nối mạng hoặc link QR.</p>
                </div>
              )}
              <p className={styles.qrOwner}>{OWNER_NAME} - {OWNER_PHONE}</p>
            </section>

            <footer className={styles.footer}>
              <p>Cảm ơn quý khách! Hẹn gặp lại!</p>
              <p>WIFI: QuanAnLongXuyen | Pass: 68686868</p>
            </footer>
          </article>
        </div>

        <div className={`${styles.bottomActions} ${styles.noPrint}`}>
          <Link to="/admin/donhang" className={styles.backLink}>Về danh sách đơn</Link>
        </div>
      </div>
    </div>
  );
}


