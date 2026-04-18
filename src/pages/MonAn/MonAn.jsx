import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ClientAxios from '../../api/ClientAxios';
import { toast } from 'react-toastify';
import AdminTopBar from '../../components/AdminTopBar';
import styles from '../MonAn.module.css';

export default function MonAn() {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFoods();
  }, []);

  const fetchFoods = async () => {
    try {
      setLoading(true);
      const response = await ClientAxios.get('/api/foods');
      setFoods(response.data.data || response.data || []);
    } catch (error) {
      toast.error('❌ Lỗi khi tải danh sách món ăn');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn chắc chắn muốn xóa món ăn này?')) return;
    try {
      await ClientAxios.delete(`/api/foods/${id}`);
      toast.success('✅ Xóa món ăn thành công');
      fetchFoods();
    } catch (error) {
      toast.error('❌ Lỗi khi xóa món ăn');
      console.error(error);
    }
  };

  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return '/default-food.png';
    if (imageUrl.startsWith('http')) return imageUrl;
    return `/uploads/${imageUrl}`;
  };

  if (loading) return <div>Đang tải...</div>;

  return (
    <div className={styles.fullPage}>
      <AdminTopBar
        activeKey="monan"
        actions={<Link to="/admin/monan/them" className={styles.addBtn}>➕ Thêm Món</Link>}
      />

      {/* Content */}
      <div className={styles.content}>
        {loading ? (
          <div>Đang tải...</div>
        ) : foods.length === 0 ? (
          <p>Không có món ăn nào</p>
        ) : (
          <table className={styles.table}>
          <thead>
            <tr>
              <th>Tên</th>
              <th>Giá</th>
              <th>Loại</th>
              <th>Hành Động</th>
            </tr>
          </thead>
          <tbody>
            {foods.map(food => (
              <tr key={food._id}>
                <td>{food.name}</td>
                <td>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(food.price)}</td>
                <td>{food.category}</td>
                <td>
                  <Link to={`/admin/monan/sua/${food._id}`} className={styles.btnEdit}>
                    ✏️
                  </Link>
                  <button 
                    onClick={() => handleDelete(food._id)}
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
