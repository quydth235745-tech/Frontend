import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ClientAxios from '../../api/ClientAxios';
import { toast } from 'react-toastify';
import styles from '../KhuyenMai.module.css';

export default function KhuyenMaiThem() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    code: '',
    type: 'percentage',
    value: '',
    expiryDate: '',
    minOrderValue: 0,
    maxUses: 1
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await ClientAxios.post('/api/coupons', {
        ma_voucher: formData.code.trim(),
        loai_giam: formData.type === 'percentage' ? 'PhanTram' : 'CoDinh',
        gia_tri: Number(formData.value),
        don_toi_thieu: Number(formData.minOrderValue || 0),
        ngay_het_han: formData.expiryDate,
        maxUses: Number(formData.maxUses || 1)
      });
      toast.success('✅ Thêm khuyến mãi thành công');
      navigate('/admin/khuyenmai');
    } catch (error) {
      toast.error('❌ Lỗi khi thêm khuyến mãi');
      console.error(error);
    }
  };

  return (
    <div className={styles.container}>
      <h2>Thêm Khuyến Mãi</h2>
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
        <div className={styles.formGroup}>
          <label>Số lượt dùng tối đa:</label>
          <input
            type="number"
            name="maxUses"
            min="1"
            value={formData.maxUses}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit" className={styles.btnSubmit}>Thêm</button>
      </form>
    </div>
  );
}
