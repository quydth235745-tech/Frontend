import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ClientAxios from '../../api/ClientAxios';
import { toast } from 'react-toastify';
import AdminTopBar from '../../components/AdminTopBar';
import styles from '../KhuyenMai.module.css';

export default function KhuyenMai() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const response = await ClientAxios.get('/api/coupons');
      setCoupons(response.data.data || response.data || []);
    } catch (error) {
      toast.error('❌ Lỗi khi tải danh sách khuyến mãi');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn chắc chắn muốn xóa khuyến mãi này?')) return;
    try {
      await ClientAxios.delete(`/api/coupons/${id}`);
      toast.success('✅ Xóa khuyến mãi thành công');
      fetchCoupons();
    } catch (error) {
      toast.error('❌ Lỗi khi xóa khuyến mãi');
      console.error(error);
    }
  };

  if (loading) return <div>Đang tải...</div>;

  return (
    <div className={styles.fullPage}>
      <AdminTopBar
        activeKey="khuyenmai"
        actions={<Link to="/admin/khuyenmai/them" className={styles.addBtn}>➕ Thêm Khuyến Mãi</Link>}
      />

      {/* Content */}
      <div className={styles.content}>
        {loading ? (
          <div>Đang tải...</div>
        ) : coupons.length === 0 ? (
          <p>Không có khuyến mãi nào</p>
        ) : (
          <table className={styles.table}>
          <thead>
            <tr>
              <th>Mã</th>
              <th>Loại</th>
              <th>Giá Trị</th>
              <th>Ngày Hết Hạn</th>
              <th>Hành Động</th>
            </tr>
          </thead>
          <tbody>
            {coupons.map(coupon => (
              <tr key={coupon._id}>
                <td>{coupon.code}</td>
                <td>{coupon.discountType === 'percent' ? 'Phần Trăm' : 'Cố Định'}</td>
                <td>{coupon.discountValue}{coupon.discountType === 'percent' ? '%' : ' VND'}</td>
                <td>{coupon.expiresAt ? new Date(coupon.expiresAt).toLocaleDateString('vi-VN') : '-'}</td>
                <td>
                  <Link to={`/admin/khuyenmai/sua/${coupon._id}`} className={styles.btnEdit}>
                    ✏️
                  </Link>
                  <button 
                    onClick={() => handleDelete(coupon._id)}
                    className={styles.btnDelete}
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        )}
      </div>
    </div>
  );
}
