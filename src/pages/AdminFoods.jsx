import React, { useState } from 'react'
import ClientAxios from '../api/ClientAxios'
import { toast } from 'react-toastify'
import styles from './AdminFoods.module.css'

function AdminFoods({ foods, setFoods, onFoodsUpdate }) {
  const [newFood, setNewFood] = useState({ name: '', price: '', category: '', image: '', discount: '' })
  const [editingFood, setEditingFood] = useState(null)
  const [editFormData, setEditFormData] = useState({ name: '', price: '', category: '', image: '', discount: '' })
  const [imageFile, setImageFile] = useState(null)

  const handleAddFood = async (e) => {
    e.preventDefault()
    if (!newFood.name || !newFood.price || !newFood.category) {
      toast.warning('⚠️ Vui lòng điền đầy đủ thông tin')
      return
    }
    try {
      const foodData = {
        ...newFood,
        price: parseInt(newFood.price),
        discount: newFood.discount ? parseInt(newFood.discount) : 0
      }
      await ClientAxios.post('/api/foods', foodData)
      toast.success('✅ Thêm món thành công')
      setNewFood({ name: '', price: '', category: '', image: '', discount: '' })
      setImageFile(null)
      onFoodsUpdate()
    } catch (err) {
      toast.error('❌ Lỗi khi thêm món')
    }
  }

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImageFile(reader.result)
        setNewFood({ ...newFood, image: reader.result })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleImageUploadEdit = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setEditFormData({ ...editFormData, image: reader.result })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleEditFood = (food) => {
    setEditingFood(food._id)
    setEditFormData({
      name: food.name,
      price: food.price,
      category: food.category,
      image: food.image,
      discount: food.discount || ''
    })
  }

  const handleUpdateFood = async () => {
    if (!editFormData.name || !editFormData.price || !editFormData.category) {
      toast.warning('⚠️ Vui lòng điền đầy đủ thông tin')
      return
    }
    try {
      const updateData = {
        name: editFormData.name,
        price: parseInt(editFormData.price),
        category: editFormData.category,
        image: editFormData.image,
        discount: editFormData.discount ? parseInt(editFormData.discount) : 0
      }
      await ClientAxios.put(`/api/foods/${editingFood}`, updateData)
      toast.success('✅ Cập nhật món thành công')
      setEditingFood(null)
      setEditFormData({ name: '', price: '', category: '', image: '', discount: '' })
      onFoodsUpdate()
    } catch (err) {
      toast.error('❌ Lỗi khi cập nhật')
    }
  }

  const handleCancelEdit = () => {
    setEditingFood(null)
    setEditFormData({ name: '', price: '', category: '', image: '', discount: '' })
  }

  const handleDeleteFood = async (id) => {
    if (window.confirm('Bạn chắc chắn muốn xóa?')) {
      try {
        await ClientAxios.delete(`/api/foods/${id}`)
        toast.success('✅ Xóa món thành công')
        onFoodsUpdate()
      } catch (err) {
        toast.error('❌ Lỗi khi xóa')
      }
    }
  }

  return (
    <>
      <h2 className={styles.header}>🍔 Quản Lý Món Ăn</h2>

      {/* Edit Modal */}
      {editingFood && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h3 className={styles.modalTitle}>✏️ Sửa Món Ăn</h3>
            <div className={styles.formGroup}>
              <input
                type="text"
                placeholder="Tên món"
                value={editFormData.name}
                onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                className={styles.input}
              />
              <input
                type="number"
                placeholder="Giá (VNĐ)"
                value={editFormData.price}
                onChange={(e) => setEditFormData({ ...editFormData, price: e.target.value })}
                className={styles.input}
              />
              <select
                value={editFormData.category}
                onChange={(e) => setEditFormData({ ...editFormData, category: e.target.value })}
                className={styles.select}
              >
                <option value="">-- Chọn loại --</option>
                <option value="Chính">Chính</option>
                <option value="Món ăn vặt">Món ăn vặt</option>
                <option value="Nước">Nước</option>
              </select>
              <input
                type="number"
                placeholder="Khuyến mãi (%) - tùy chọn"
                value={editFormData.discount}
                onChange={(e) => setEditFormData({ ...editFormData, discount: e.target.value })}
                className={styles.input}
              />
              <div>
                <label className={styles.label}>📸 Ảnh Món</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUploadEdit}
                  className={styles.fileInput}
                />
                {editFormData.image && (
                  <img src={editFormData.image} className={styles.imagePreview} alt="preview" />
                )}
              </div>
              <div className={styles.modalButtons}>
                <button className={styles.saveBtn} onClick={handleUpdateFood}>
                  💾 Lưu
                </button>
                <button className={styles.cancelBtn} onClick={handleCancelEdit}>
                  ❌ Hủy
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Food Form */}
      <div className={styles.addFoodForm}>
        <h3 className={styles.formTitle}>➕ Thêm Món Ăn Mới</h3>
        <form onSubmit={handleAddFood}>
          <div className={styles.formGrid}>
            <input
              type="text"
              placeholder="Tên món"
              value={newFood.name}
              onChange={(e) => setNewFood({ ...newFood, name: e.target.value })}
              className={styles.input}
            />
            <input
              type="number"
              placeholder="Giá (VNĐ)"
              value={newFood.price}
              onChange={(e) => setNewFood({ ...newFood, price: e.target.value })}
              className={styles.input}
            />
            <select
              value={newFood.category}
              onChange={(e) => setNewFood({ ...newFood, category: e.target.value })}
              className={styles.select}
            >
              <option value="">-- Chọn loại --</option>
              <option value="Chính">Chính</option>
              <option value="Món ăn vặt">Món ăn vặt</option>
              <option value="Nước">Nước</option>
            </select>
            <input
              type="number"
              placeholder="Khuyến mãi (%) - tùy chọn"
              value={newFood.discount}
              onChange={(e) => setNewFood({ ...newFood, discount: e.target.value })}
              className={styles.input}
            />
            <div className={styles.fileInputWrapper}>
              <label className={styles.label}>📸 Tải Ảnh</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className={styles.fileInput}
              />
            </div>
            <button type="submit" className={styles.submitButton}>
              ✓ Thêm Món
            </button>
          </div>
          {imageFile && <p className={styles.successMessage}>✓ Ảnh được chọn</p>}
        </form>
      </div>

      {/* Foods List */}
      <div className={styles.foodsList}>
        <h3 className={styles.listTitle}>📝 Danh Sách Món Ăn ({foods.length})</h3>
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead className={styles.tableHeader}>
              <tr>
                <th className={styles.tableHeadCell}>Ảnh</th>
                <th className={styles.tableHeadCell}>Tên Món</th>
                <th className={styles.tableHeadCell}>Loại</th>
                <th className={`${styles.tableHeadCell} ${styles.price}`}>Giá</th>
                <th className={styles.tableHeadCell}>Khuyến Mãi</th>
                <th className={styles.tableHeadCell}>Hành Động</th>
              </tr>
            </thead>
            <tbody>
              {foods.map(f => (
                <tr key={f._id} className={styles.tableRow}>
                  <td className={styles.tableCell}>
                    <img src={f.image} className={styles.foodImage} alt={f.name} />
                  </td>
                  <td className={styles.tableCell}>{f.name}</td>
                  <td className={`${styles.tableCell} ${styles.category}`}>{f.category}</td>
                  <td className={`${styles.tableCell} ${styles.price}`}>{f.price.toLocaleString()} đ</td>
                  <td className={`${styles.tableCell} ${styles.discount} ${!f.discount ? styles.none : ''}`}>
                    {f.discount ? `${f.discount}%` : '-'}
                  </td>
                  <td className={`${styles.tableCell} ${styles.actions}`}>
                    <button onClick={() => handleEditFood(f)} className={styles.editBtn}>
                      ✏️ Sửa
                    </button>
                    <button onClick={() => handleDeleteFood(f._id)} className={styles.deleteBtn}>
                      🗑️ Xóa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}

export default AdminFoods


