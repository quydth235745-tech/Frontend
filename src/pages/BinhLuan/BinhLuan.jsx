import { useEffect, useState } from 'react';
import ClientAxios from '../../api/ClientAxios';
import AdminTopBar from '../../components/AdminTopBar';
import styles from './BinhLuan.module.css';

export default function BinhLuan() {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchComments();
  }, []);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const response = await ClientAxios.get('/api/comments');
      setComments(response.data.data || response.data || []);
    } catch (error) {
      console.error('Lỗi tải bình luận:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      const newStatus = currentStatus === 1 ? 0 : 1;
      await ClientAxios.put(`/api/comments/${id}`, { trang_thai: newStatus });
      fetchComments();
      alert('Cập nhật trạng thái thành công!');
    } catch (error) {
      console.error('Lỗi cập nhật:', error);
      alert('Cập nhật thất bại!');
    }
  };

  const renderStars = (rating) => {
    return (
      <div style={{ display: 'flex', gap: '2px' }}>
        {[1, 2, 3, 4, 5].map(i => (
          <span
            key={i}
            style={{
              color: i <= rating ? '#fbbf24' : '#e2e8f0',
              fontSize: '16px'
            }}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className={styles.fullPage}>
      <AdminTopBar activeKey="binhluan" />

      {/* Content */}
      <div className={styles.content}>
        {loading ? (
          <div className={styles.loading}>Đang tải...</div>
        ) : (
          <table className={styles.table}>
          <thead>
            <tr>
              <th style={{ width: '15%' }}>KHÁCH HÀNG</th>
              <th style={{ width: '15%' }}>MÓN ĂN / CHỦ ĐỀ</th>
              <th style={{ width: '35%' }}>NỘI DUNG ĐÁNH GIÁ</th>
              <th style={{ width: '10%', textAlign: 'center' }}>ĐÁNH GIÁ</th>
              <th style={{ width: '10%', textAlign: 'center' }}>TRẠNG THÁI</th>
              <th style={{ width: '15%', textAlign: 'center' }}>THAO TÁC</th>
            </tr>
          </thead>
          <tbody>
            {comments.length === 0 ? (
              <tr>
                <td colSpan="6" className={styles.noData}>
                  Chưa có bình luận nào.
                </td>
              </tr>
            ) : (
              comments.map((comment) => (
                <tr key={comment.id}>
                  <td>
                    <b style={{ color: '#1e293b' }}>
                      {comment.customer_name || comment.ten_khach_hang}
                    </b>
                    <br />
                    <small style={{ color: '#64748b' }}>
                      {comment.phone || comment.sdt_khach}
                    </small>
                  </td>
                  <td>
                    <span className={styles.badgeFood}>
                      {comment.food_name || comment.mon_an || 'Đánh giá chung'}
                    </span>
                  </td>
                  <td>
                    <i style={{ color: '#475569' }}>
                      "{comment.content || comment.noi_dung}"
                    </i>
                    <br />
                    <small style={{ color: '#94a3b8' }}>
                      {new Date(comment.createdAt || comment.ngay_tao).toLocaleString(
                        'vi-VN'
                      )}
                    </small>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    {renderStars(comment.rating || comment.so_sao || 5)}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    {(comment.trang_thai || 1) === 1 ? (
                      <span className={styles.badgeShow}>Hiển thị</span>
                    ) : (
                      <span className={styles.badgeHide}>Đã ẩn</span>
                    )}
                  </td>
                  <td style={{ textAlign: 'center' }} className={styles.actions}>
                    {(comment.trang_thai || 1) === 1 ? (
                      <button
                        className={styles.btnHide}
                        onClick={() =>
                          handleToggleStatus(comment.id, comment.trang_thai || 1)
                        }
                      >
                        Ẩn đi
                      </button>
                    ) : (
                      <button
                        className={styles.btnShow}
                        onClick={() =>
                          handleToggleStatus(comment.id, comment.trang_thai || 0)
                        }
                      >
                        Bật lại
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        )}
      </div>
    </div>
  );
}


