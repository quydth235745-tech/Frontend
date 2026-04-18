import React, { useState, useRef } from 'react'
import ClientAxios from '../api/ClientAxios'
import { toast } from 'react-toastify'
import styles from './AdminOrders.module.css'
import { generateInvoicePDF } from '../utils/invoiceGenerator'

function AdminOrders({ orders, onOrdersUpdate }) {
  const [updatingOrderId, setUpdatingOrderId] = useState(null)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState(null)
  const statusUpdateRef = useRef({})

  const handleUpdateOrderStatus = async (id, newStatus) => {
    // Prevent duplicate requests
    if (statusUpdateRef.current[id]) return

    setUpdatingOrderId(id)
    statusUpdateRef.current[id] = true

    try {
      await ClientAxios.patch(`/api/orders/${id}/status`, { status: newStatus })
      toast.success('✅ Cập nhật trạng thái thành công!')
      // Update selectedOrder if it's the one being viewed
      if (selectedOrder && selectedOrder._id === id) {
        setSelectedOrder({ ...selectedOrder, status: newStatus })
      }
      onOrdersUpdate()
    } catch (err) {
      console.error('Lỗi cập nhật trạng thái đơn hàng:', err)
      toast.error(err.response?.data?.message || '❌ Lỗi cập nhật trạng thái đơn hàng')
    } finally {
      setUpdatingOrderId(null)
      delete statusUpdateRef.current[id]
    }
  }

  const getStatusSelectClass = (status) => {
    if (status === 'completed') return `${styles.statusSelect} ${styles.completed}`
    if (status === 'pending') return `${styles.statusSelect} ${styles.pending}`
    return `${styles.statusSelect} ${styles.updating}`
  }

  const getStatusBadge = (status) => {
    const badges = {
      pending: '⏳ Chờ xử lý',
      confirmed: '✓ Xác nhận',
      preparing: '🔧 Chuẩn bị',
      ready: '📦 Sẵn sàng',
      shipping: '🚚 Đang giao',
      delivered: '✅ Hoàn thành',
      cancelled: '✕ Hủy'
    }
    return badges[status] || status
  }

  const handleDownloadInvoice = async () => {
    try {
      const doc = await generateInvoicePDF(selectedOrder)
      const pdfDataUrl = doc.output('dataurlstring')
      setPdfPreviewUrl(pdfDataUrl)
    } catch (err) {
      console.error('Error generating invoice:', err)
      toast.error('❌ Lỗi khi tạo bill')
    }
  }

  const handleConfirmDownload = () => {
    try {
      const link = document.createElement('a')
      link.href = pdfPreviewUrl
      link.download = `invoice-${selectedOrder._id}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      setPdfPreviewUrl(null)
      toast.success('✅ Xuất bill thành công!')
    } catch (err) {
      console.error('Error downloading:', err)
      toast.error('❌ Lỗi khi tải file')
    }
  }

  const handleApproveOrder = async () => {
    try {
      await ClientAxios.patch(`/api/orders/${selectedOrder._id}/status`, { status: 'confirmed' })
      toast.success('✅ Duyệt đơn hàng thành công!')
      setSelectedOrder({ ...selectedOrder, status: 'confirmed' })
      onOrdersUpdate()
    } catch (err) {
      console.error('Error approving order:', err)
      toast.error(err.response?.data?.message || '❌ Lỗi khi duyệt đơn hàng')
    }
  }

  const handleCancelOrder = async () => {
    if (!window.confirm('⚠️ Bạn chắc chắn muốn hủy đơn hàng này?')) {
      return
    }
    
    try {
      await ClientAxios.patch(`/api/orders/${selectedOrder._id}/status`, { status: 'cancelled' })
      toast.success('✅ Hủy đơn hàng thành công!')
      setSelectedOrder(null)
      onOrdersUpdate()
    } catch (err) {
      console.error('Error cancelling order:', err)
      toast.error(err.response?.data?.message || '❌ Lỗi khi hủy đơn hàng')
    }
  }

  return (
    <>
      <h2 className={styles.header}>📦 Xử Lý Đơn Hàng</h2>
      <div className={styles.card}>
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead className={styles.tableHeader}>
              <tr>
                <th className={styles.tableHeadCell}>Khách</th>
                <th className={styles.tableHeadCell}>Trạng Thái</th>
                <th className={styles.tableHeadCell}>Tổng Tiền</th>
                <th className={styles.tableHeadCell}>Thao Tác</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(o => (
                <tr key={o._id} className={styles.tableRow}>
                  <td className={`${styles.tableCell} ${styles.customerName}`}>{o.customerName}</td>
                  <td className={styles.tableCell}>
                    <select
                      value={o.status}
                      onChange={(e) => handleUpdateOrderStatus(o._id, e.target.value)}
                      disabled={updatingOrderId === o._id}
                      className={getStatusSelectClass(o.status)}
                    >
                      <option value="pending">⏳ Chờ xử lý</option>
                      <option value="confirmed">✓ Xác nhận</option>
                      <option value="preparing">🔧 Chuẩn bị</option>
                      <option value="ready">📦 Sẵn sàng</option>
                      <option value="shipping">🚚 Đang giao</option>
                      <option value="delivered">✅ Hoàn thành</option>
                      <option value="cancelled">✕ Hủy</option>
                    </select>
                    {updatingOrderId === o._id && <span className={styles.updatingIndicator}>⏳</span>}
                  </td>
                  <td className={`${styles.tableCell} ${styles.totalPrice}`}>{o.totalPrice.toLocaleString()} đ</td>
                  <td className={styles.tableCell}>
                    <button
                      onClick={() => setSelectedOrder(o)}
                      className={styles.viewBtn}
                    >
                      👁️ Xem
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Chi Tiết Đơn Hàng */}
      {selectedOrder && (
        <div className={styles.modalOverlay} onClick={() => setSelectedOrder(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>📋 Chi Tiết Đơn Hàng #{selectedOrder._id.slice(-6).toUpperCase()}</h3>
              <button
                className={styles.closeBtn}
                onClick={() => setSelectedOrder(null)}
              >
                ✕
              </button>
            </div>

            <div className={styles.modalBody}>
              {/* Thông tin khách hàng */}
              <div className={styles.section}>
                <h4>👤 Thông Tin Khách Hàng</h4>
                <div className={styles.infoGrid}>
                  <div>
                    <strong>Tên:</strong> {selectedOrder.customerName}
                  </div>
                  <div>
                    <strong>Email:</strong> {selectedOrder.customerEmail}
                  </div>
                  <div>
                    <strong>Điện thoại:</strong> {selectedOrder.phone}
                  </div>
                  <div>
                    <strong>Địa chỉ:</strong> {selectedOrder.address}
                  </div>
                </div>
              </div>

              {/* Danh sách sản phẩm */}
              <div className={styles.section}>
                <h4>🍔 Danh Sách Sản Phẩm</h4>
                <div className={styles.itemsList}>
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className={styles.itemRow}>
                      <div className={styles.itemName}>{item.name}</div>
                      <div className={styles.itemQty}>x{item.quantity}</div>
                      <div className={styles.itemPrice}>{(item.price * item.quantity).toLocaleString()} đ</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tổng tiền */}
              <div className={styles.section}>
                <div className={styles.totalRow}>
                  <strong>Tổng cộng:</strong>
                  <strong className={styles.totalAmount}>{selectedOrder.totalPrice.toLocaleString()} đ</strong>
                </div>
              </div>

              {/* Trạng thái */}
              <div className={styles.section}>
                <h4>📊 Trạng Thái Đơn</h4>
                <p className={styles.statusBadge}>{getStatusBadge(selectedOrder.status)}</p>
              </div>
            </div>

            <div className={styles.modalFooter}>
              {selectedOrder.status === 'pending' && (
                <button
                  className={styles.approveBtn}
                  onClick={handleApproveOrder}
                >
                  ✓ Duyệt Đơn
                </button>
              )}
              <button
                className={styles.downloadBtn}
                onClick={handleDownloadInvoice}
              >
                📄 Xuất Bill
              </button>
              {selectedOrder.status !== 'delivered' && selectedOrder.status !== 'cancelled' && (
                <button
                  className={styles.cancelBtn}
                  onClick={handleCancelOrder}
                >
                  🚫 Hủy Đơn
                </button>
              )}
              <button
                className={styles.closeModalBtn}
                onClick={() => setSelectedOrder(null)}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PDF Preview Modal */}
      {pdfPreviewUrl && (
        <div className={styles.modalOverlay} onClick={() => setPdfPreviewUrl(null)}>
          <div className={`${styles.modal} ${styles.pdfPreviewModal}`} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>📄 Xem Trước Hóa Đơn</h3>
              <button
                className={styles.closeBtn}
                onClick={() => setPdfPreviewUrl(null)}
              >
                ✕
              </button>
            </div>
            <div className={styles.pdfPreviewContainer}>
              <iframe
                src={pdfPreviewUrl}
                style={{
                  width: '100%',
                  height: '100%',
                  border: 'none',
                  borderRadius: '8px'
                }}
                title="PDF Preview"
              />
            </div>
            <div className={styles.modalFooter}>
              <button
                className={styles.downloadBtn}
                onClick={handleConfirmDownload}
              >
                ⬇️ Tải Xuống
              </button>
              <button
                className={styles.closeModalBtn}
                onClick={() => setPdfPreviewUrl(null)}
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default AdminOrders


