import React, { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import './tracking-order.css'
import {
  getCustomerName,
  getOrderCode,
  getOrderTotal,
  normalizeOrderStatus
} from '../utils/orderMapper'

const RESTAURANT_LOCATION = { lat: 10.3699, lng: 104.7666 } // Long Xuyên, An Giang

// Fix Leaflet marker icon
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png'
})

function OrderTracking({ order }) {
  const mapRef = useRef(null)

  // Status timeline
  const statuses = [
    { status: 'pending', label: 'Đặt hàng', icon: '📝', time: order?.createdAt },
    { status: 'confirmed', label: 'Xác nhận', icon: '✅', time: order?.confirmedAt },
    { status: 'preparing', label: 'Chuẩn bị', icon: '👨‍🍳', time: order?.preparingAt },
    { status: 'ready', label: 'Sẵn sàng', icon: '📦', time: order?.readyAt },
    { status: 'shipping', label: 'Đang giao', icon: '🚗', time: order?.shippingAt },
    { status: 'delivered', label: 'Giao thành công', icon: '✨', time: order?.deliveredAt }
  ]

  const getStatusIndex = (status) => {
    const map = {
      'pending': 0,
      'confirmed': 1,
      'preparing': 2,
      'ready': 3,
      'shipping': 4,
      'delivered': 5
    }
    return map[status] || 0
  }

  const currentStatusIndex = getStatusIndex(normalizeOrderStatus(order?.status))

  useEffect(() => {
    if (!mapRef.current) return

    console.log('🗺️ Order tracking:', { status: order.status, deliveryLocation: order.deliveryLocation, address: order.address }); // DEBUG

    // Initialize Leaflet map
    const mapInstance = L.map(mapRef.current).setView([RESTAURANT_LOCATION.lat, RESTAURANT_LOCATION.lng], 14)

    // Add satellite/aerial imagery layer (Esri WorldImagery)
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      attribution: '&copy; Esri',
      maxZoom: 18
    }).addTo(mapInstance)

    // Restaurant marker (red)
    L.circleMarker([RESTAURANT_LOCATION.lat, RESTAURANT_LOCATION.lng], {
      radius: 8,
      fillColor: '#ff4444',
      color: '#ff0000',
      weight: 2,
      opacity: 1,
      fillOpacity: 0.8
    }).addTo(mapInstance)
      .bindPopup('🍕 Nhà hàng (Long Xuyên)')

    // Delivery location marker (blue)
    if (order.deliveryLocation && order.deliveryLocation.coordinates) {
      // Handle GeoJSON format: coordinates are [lng, lat]
      const coords = order.deliveryLocation.coordinates;
      const deliveryLng = coords[0];
      const deliveryLat = coords[1];

      console.log('✅ Delivery coords:', { lat: deliveryLat, lng: deliveryLng }); // DEBUG

      if (deliveryLat && deliveryLng && deliveryLat !== 0 && deliveryLng !== 0) {
        L.circleMarker([deliveryLat, deliveryLng], {
          radius: 8,
          fillColor: '#4444ff',
          color: '#0000ff',
          weight: 2,
          opacity: 1,
          fillOpacity: 0.8
        }).addTo(mapInstance)
          .bindPopup('📍 Địa chỉ giao hàng')

        // Draw route
        const routeLine = L.polyline([
          [RESTAURANT_LOCATION.lat, RESTAURANT_LOCATION.lng],
          [deliveryLat, deliveryLng]
        ], {
          color: '#ff6b35',
          weight: 3,
          opacity: 0.7,
          dashArray: '5, 5'
        }).addTo(mapInstance)

        // Fit bounds to show both points with delay
        setTimeout(() => {
          try {
            const bounds = routeLine.getBounds()
            console.log('📍 Bounds:', bounds); // DEBUG
            mapInstance.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 })
          } catch (err) {
            console.error('Fit bounds error:', err);
          }
        }, 300);
      } else {
        console.warn('❌ Invalid delivery coords:', { lat: deliveryLat, lng: deliveryLng }); // DEBUG
      }
    } else {
      console.warn('⚠️  deliveryLocation missing or invalid format:', order.deliveryLocation); // DEBUG
    }

    return () => {
      mapInstance.remove()
    }
  }, [order])

  return (
    <div className="tracking-container">
      {/* Map */}
      <div className="tracking-map-section">
        <div ref={mapRef} className="tracking-map"></div>
        <div className="map-info">
          <div className="info-item">
            <span className="info-label">📍 Từ:</span>
            <span className="info-value">Nhà hàng</span>
          </div>
          <div className="info-item">
            <span className="info-label">🏠 Đến:</span>
            <span className="info-value">{order?.address || 'Chưa rõ'}</span>
          </div>
          {order?.estimatedDelivery && (
            <div className="info-item">
              <span className="info-label">⏱️ Dự kiến:</span>
              <span className="info-value">{new Date(order.estimatedDelivery).toLocaleTimeString('vi-VN')}</span>
            </div>
          )}
        </div>
      </div>

      {/* Status Timeline */}
      <div className="tracking-timeline">
        <h3>📊 Trạng thái đơn hàng</h3>
        <div className="timeline">
          {statuses.map((item, index) => (
            <div key={item.status} className="timeline-item">
              <div className={`timeline-dot ${index <= currentStatusIndex ? 'active' : ''}`}>
                <span>{item.icon}</span>
              </div>
              <div className={`timeline-content ${index <= currentStatusIndex ? 'active' : ''}`}>
                <div className="timeline-label">{item.label}</div>
                {item.time && (
                  <div className="timeline-time">
                    {new Date(item.time).toLocaleString('vi-VN')}
                  </div>
                )}
              </div>
              {index < statuses.length - 1 && (
                <div className={`timeline-line ${index < currentStatusIndex ? 'active' : ''}`}></div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Order Summary */}
      <div className="tracking-summary">
        <h3>📦 Tóm tắt đơn hàng</h3>
        <div className="summary-info">
          <div className="info-row">
            <span>Mã đơn:</span>
            <strong>#{getOrderCode(order)}</strong>
          </div>
          <div className="info-row">
            <span>Khách hàng:</span>
            <strong>{getCustomerName(order)}</strong>
          </div>
          <div className="info-row">
            <span>Điện thoại:</span>
            <strong>{order?.phone || 'N/A'}</strong>
          </div>
          <div className="info-row">
            <span>Địa chỉ:</span>
            <strong>{order?.address || 'N/A'}</strong>
          </div>
          <div className="info-row">
            <span>Tổng tiền:</span>
            <strong className="total-price">{getOrderTotal(order).toLocaleString()} VNĐ</strong>
          </div>
        </div>

        {/* Items */}
        <h4 style={{ marginTop: '20px' }}>🍽️ Các món ăn:</h4>
        <div className="items-list">
          {order?.items && order.items.length > 0 ? (
            order.items.map((item, idx) => (
              <div key={idx} className="item">
                <span>{item.name || 'Món không tên'} x{item.quantity || 0}</span>
                <span className="price">{((item.price || 0) * (item.quantity || 0)).toLocaleString()} VNĐ</span>
              </div>
            ))
          ) : (
            <div className="item">
              <span>Không có món nào</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default OrderTracking
