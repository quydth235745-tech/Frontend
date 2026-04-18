export const normalizeOrderStatus = (status) => {
  const map = {
    0: 'pending',
    1: 'confirmed',
    cho_xu_ly: 'pending',
    da_xac_nhan: 'confirmed',
    delivering: 'shipping',
    completed: 'delivered'
  };

  return map[status] || status || 'pending';
};

export const getOrderStatusLabel = (status) => {
  const normalized = normalizeOrderStatus(status);
  const labels = {
    pending: 'Đặt hàng',
    confirmed: 'Xác nhận',
    preparing: 'Chuẩn bị',
    ready: 'Sẵn sàng',
    shipping: 'Đang giao',
    delivered: 'Giao thành công',
    cancelled: 'Đơn hủy'
  };

  return labels[normalized] || String(normalized);
};

export const getOrderStatusVariant = (status) => {
  const normalized = normalizeOrderStatus(status);

  if (normalized === 'pending') return 'warning';
  if (normalized === 'cancelled') return 'danger';
  if (normalized === 'delivered') return 'success';
  return 'info';
};

export const getOrderId = (order) => order?._id || order?.id || '';

export const getOrderCode = (order, length = 6) => {
  const id = String(getOrderId(order));
  if (!id) return 'N/A';
  return id.slice(-length).toUpperCase();
};

export const getCustomerName = (order) =>
  order?.customerName || order?.customer_name || order?.ten_khach_hang || 'N/A';

export const getOrderTotal = (order) =>
  Number(order?.totalPrice ?? order?.total_price ?? order?.tong_tien ?? 0);

export const getShippingFee = (order) =>
  Number(order?.shippingFee ?? order?.phi_ship ?? 0);

export const getOrderDate = (order) => order?.createdAt || order?.ngay_dat || null;

export const getPaymentMethod = (order) =>
  order?.paymentMethod || order?.payment_method || order?.phuong_thuc || 'cash';

export const isPendingOrder = (status) => normalizeOrderStatus(status) === 'pending';

export const canCancelOrder = (orderStatus) => {
  const status = normalizeOrderStatus(orderStatus);
  return status !== 'delivered' && status !== 'cancelled';
};