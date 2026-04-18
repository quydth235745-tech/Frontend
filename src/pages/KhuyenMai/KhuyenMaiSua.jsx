import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ClientAxios from '../../api/ClientAxios';
import { toast } from 'react-toastify';
import styles from '../KhuyenMai.module.css';

export default function KhuyenMaiSua() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    code: '',
    type: 'percentage',
    value: '',
    expiryDate: '',
    minOrderValue: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCoupon();
  }, [id]);

  const fetchCoupon = async () => {
    try {
      const response = await ClientAxios.get(`/api/coupons/${id}`);
      setFormData(response.data.data || response.data);
    } catch (error) {
      toast.error('❌ Lỗi khi tải khuyến mãi');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await ClientAxios.put(`/api/coupons/${id}`, formData);
      toast.success('✅ Cập nhật khuyến mãi thành công');
      navigate('/admin/khuyenmai');
    } catch (error) {
      toast.error('❌ Lỗi khi cập nhật khuyến mãi');
      console.error(error);
    }
  };

  if (loading) return <div>Đang tải...</div>;

  return (
    <div className={styles.container}>
      <h2>Sửa Khuyến Mãi</h2>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label>Mã Khuyến Mãi:</label>
          <input
            type="text"
            name="code"
            value={formData.code}
            onChange={handleChange}
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label>Loại:</label>
          <select name="type" value={formData.type} onChange={handleChange}>
            <option value="percentage">Phần Trăm (%)</option>
            <option value="fixed">Cố Định (VND)</option>
          </select>
        </div>
        <div className={styles.formGroup}>
          <label>Giá Trị:</label>
          <input
            type="number"
            name="value"
            value={formData.value}
            onChange={handleChange}
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label>Ngày Hết Hạn:</label>
          <input
            type="date"
            name="expiryDate"
            value={formData.expiryDate}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit" className={styles.btnSubmit}>Cập Nhật</button>
      </form>
    </div>
  );
}
