import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ClientAxios from '../../api/ClientAxios';
import { toast } from 'react-toastify';
import styles from '../MonAn.module.css';

export default function MonAnThem() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: '',
    description: '',
    image: ''
  });
  const [imagePreview, setImagePreview] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, image: file }));
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: formData.name.trim(),
        price: Number(formData.price),
        category: formData.category.trim(),
        description: formData.description.trim(),
        image: formData.image || ''
      };

      await ClientAxios.post('/api/foods', payload);
      toast.success('✅ Thêm món ăn thành công');
      navigate('/admin/monan');
    } catch (error) {
      toast.error('❌ Lỗi khi thêm món ăn');
      console.error(error);
    }
  };

  return (
    <div className={styles.container}>
      <h2>Thêm Món Ăn</h2>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label>Tên Món Ăn:</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label>Giá:</label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label>Loại:</label>
          <select name="category" value={formData.category} onChange={handleChange}>
            <option value="">-- Chọn loại --</option>
            <option value="Chính">Chính</option>
            <option value="Món ăn vặt">Món ăn vặt</option>
            <option value="Nước">Nước</option>
          </select>
        </div>
        <div className={styles.formGroup}>
          <label>Mô Tả:</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
          />
        </div>
        <div className={styles.formGroup}>
          <label>Hình Ảnh:</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
          />
          {imagePreview && <img src={imagePreview} alt="Preview" style={{ maxWidth: '200px', maxHeight: '200px' }} />}
        </div>
        <button type="submit" className={styles.btnSubmit}>Thêm</button>
      </form>
    </div>
  );
}
