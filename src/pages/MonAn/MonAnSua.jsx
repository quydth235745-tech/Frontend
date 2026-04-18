import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ClientAxios from '../../api/ClientAxios';
import { toast } from 'react-toastify';
import styles from '../MonAn.module.css';

export default function MonAnSua() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: 'Chính Yếu',
    description: '',
    image: ''
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFood();
  }, [id]);

  const fetchFood = async () => {
    try {
      const response = await ClientAxios.get(`/api/foods/${id}`);
      const food = response.data.data || response.data;
      setFormData(food);
      if (food.image) {
        setImagePreview(food.image.startsWith('http') ? food.image : `/uploads/${food.image}`);
      }
    } catch (error) {
      toast.error('❌ Lỗi khi tải món ăn');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

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
      const data = new FormData();
      data.append('name', formData.name);
      data.append('price', formData.price);
      data.append('category', formData.category);
      data.append('description', formData.description);
      if (formData.image && formData.image instanceof File) {
        data.append('image', formData.image);
      }
      
      await ClientAxios.put(`/api/foods/${id}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('✅ Cập nhật món ăn thành công');
      navigate('/admin/monan');
    } catch (error) {
      toast.error('❌ Lỗi khi cập nhật món ăn');
      console.error(error);
    }
  };

  if (loading) return <div>Đang tải...</div>;

  return (
    <div className={styles.container}>
      <h2>Sửa Món Ăn</h2>
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
            <option>Chính Yếu</option>
            <option>Tráng Miệng</option>
            <option>Thức Uống</option>
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
        <button type="submit" className={styles.btnSubmit}>Cập Nhật</button>
      </form>
    </div>
  );
}
