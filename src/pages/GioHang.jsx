import React, { useContext, useEffect, useRef, useState } from 'react'
import ClientAxios from '../api/ClientAxios'
import { AuthContext } from '../context/ContextXacThuc'
import { toast } from 'react-toastify'
import { Link, useNavigate } from 'react-router-dom'

const RESTAURANT_LOCATION = { lat: 10.3699, lng: 104.7666 } // Long Xuyên, An Giang

function Cart() {
    const { user } = useContext(AuthContext)
    const [cartItems, setCartItems] = useState([])
    const [customer, setCustomer] = useState({ name: '', email: '', phone: '', address: '' })
    const [deliveryLocation, setDeliveryLocation] = useState(null)
    const [shippingFee, setShippingFee] = useState(5000)
    const [couponCode, setCouponCode] = useState('')
    const [appliedCoupon, setAppliedCoupon] = useState(null)
    const [applyingCoupon, setApplyingCoupon] = useState(false)
    const [availableCoupons, setAvailableCoupons] = useState([])
    const [loadingCoupons, setLoadingCoupons] = useState(false)
    const [loading, setLoading] = useState(false)
    const addressRef = useRef(null)
    const navigate = useNavigate()

    const fetchCartItems = () => {
        const items = JSON.parse(localStorage.getItem('cart')) || []
        setCartItems(items)
    }

    // Initialize customer info from logged-in user
    useEffect(() => {
        fetchCartItems()
        if (user) {
            setCustomer(prev => ({
                ...prev,
                name: prev.name || user.name || '',
                email: prev.email || user.email || ''
            }))
        }
    }, [user])

    // Update item quantity in cart
    const updateQuantity = (foodId, change) => {
        const updated = cartItems.map(item => {
            if (item._id === foodId) {
                const newQty = Math.max(1, (item.quantity || 1) + change)
                return { ...item, quantity: newQty }
            }
            return item
        })
        setCartItems(updated)
        localStorage.setItem('cart', JSON.stringify(updated))
    }

    // Remove item from cart
    const removeFromCart = (foodId) => {
        const updated = cartItems.filter(item => item._id !== foodId)
        setCartItems(updated)
        localStorage.setItem('cart', JSON.stringify(updated))
        toast.info('Đã xóa khỏi giỏ hàng')
    }

    // Calculate shipping fee via backend API
    const calculateShipping = async (location) => {
        try {
            const response = await ClientAxios.post('/api/orders/calculate-shipping', {
                deliveryLocation: {
                    type: 'Point',
                    coordinates: [location.lng, location.lat] // [lng, lat]
                },
                items: cartItems
            })
            
            setShippingFee(response.data.shippingFee)
            console.log(`📏 Distance: ${response.data.distance.toFixed(1)}km, Shipping fee: ${response.data.shippingFee.toLocaleString()} VNĐ, Total: ${response.data.totalShipping.toLocaleString()} VNĐ`)
        } catch (err) {
            console.error('Error calculating shipping:', err)
            // Fallback: use local calculation
            const R = 6371
            const lat1 = RESTAURANT_LOCATION.lat * Math.PI / 180
            const lat2 = location.lat * Math.PI / 180
            const dLat = (location.lat - RESTAURANT_LOCATION.lat) * Math.PI / 180
            const dLng = (location.lng - RESTAURANT_LOCATION.lng) * Math.PI / 180
            
            const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                      Math.cos(lat1) * Math.cos(lat2) *
                      Math.sin(dLng/2) * Math.sin(dLng/2)
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
            const distance = R * c

            const baseFee = 5000
            const freeKm = 2
            const feePerKm = 2500
            const maxFee = 30000
            const safeDistance = Math.min(Math.max(distance, 0), 30)
            const extraKm = Math.max(0, Math.ceil(safeDistance) - freeKm)
            const fee = Math.min(baseFee + (extraKm * feePerKm), maxFee)
            setShippingFee(fee)
            console.log(`📏 Fallback distance: ${distance.toFixed(1)}km, fee: ${fee}`)
        }
    }

    // Geocode using Nominatim (OpenStreetMap) - free, no API key
    const geocodeAddress = async (address) => {
        try {
            // Try with Vietnam first
            let searchQuery = `${address}, Vietnam`
            let response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&countrycodes=vn&limit=1`)
            let data = await response.json()
            
            // If not found, try without country code
            if (!data || data.length === 0) {
                console.log('Trying without country restriction...')
                response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`)
                data = await response.json()
            }
            
            // If still not found, try just the province/district part
            if (!data || data.length === 0) {
                console.log('Trying simplified search...')
                // Extract last part (usually province/district)
                const parts = address.split(',')
                const simplified = parts[parts.length - 1].trim()
                if (simplified && simplified !== address) {
                    response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(simplified + ', Vietnam')}&limit=1`)
                    data = await response.json()
                }
            }
            
            if (data && data.length > 0) {
                const location = {
                    lat: parseFloat(data[0].lat),
                    lng: parseFloat(data[0].lon)
                }
                console.log('✅ Geocoding successful:', location)
                setDeliveryLocation(location)
                await calculateShipping(location)
                toast.success('✅ Tìm thấy vị trí giao hàng!')
                return true
            } else {
                console.warn('❌ Nominatim could not find address:', address)
                return false
            }
        } catch (err) {
            console.error('Geocode error:', err)
            return false
        }
    }

    // Handle address input change
    const handleAddressChange = (e) => {
        const address = e.target.value
        setCustomer((prev) => ({ ...prev, address }))
        // Reset location when address changes so it can be re-geocoded
        setDeliveryLocation(null)
        setShippingFee(5000)
    }

    // Handle address blur - geocode if Google Maps not available
    const handleAddressBlur = async () => {
        if (customer.address && !deliveryLocation) {
            // First try Nominatim
            const success = await geocodeAddress(customer.address)
            if (!success) {
                console.warn('Nominatim geocoding failed, address will be accepted as text')
            }
        }
    }

    useEffect(() => {
        const loadGoogleMaps = () => {
            if (!import.meta.env.VITE_GOOGLE_API_KEY) {
                return
            }

            if (window.google && window.google.maps) {
                initAutocomplete()
                return
            }

            const scriptId = 'google-maps-script'
            if (document.getElementById(scriptId)) {
                document.getElementById(scriptId).addEventListener('load', initAutocomplete)
                return
            }

            const script = document.createElement('script')
            script.id = scriptId
            script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_API_KEY}&libraries=places`
            script.async = true
            script.defer = true
            script.onload = initAutocomplete
            document.head.appendChild(script)
        }

        const initAutocomplete = () => {
            if (!addressRef.current || !window.google || !window.google.maps) {
                return
            }

            const autocomplete = new window.google.maps.places.Autocomplete(addressRef.current, {
                types: ['geocode'],
                componentRestrictions: { country: 'vn' }
            })

            autocomplete.addListener('place_changed', () => {
                const place = autocomplete.getPlace()
                if (!place.geometry) {
                    toast.warn('Vui lòng chọn địa chỉ hợp lệ từ gợi ý.')
                    return
                }

                const location = {
                    lat: place.geometry.location.lat(),
                    lng: place.geometry.location.lng()
                }

                setCustomer((prev) => ({ ...prev, address: place.formatted_address || prev.address }))
                setDeliveryLocation(location)
                calculateShipping(location)
            })
        }

        loadGoogleMaps()
        // Google autocomplete should be initialized once when the page mounts.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const totalPrice = cartItems.reduce((sum, item) => {
        const price = Number(item.price) || 0
        const qty = Number(item.quantity) || 1
        return sum + price * qty
    }, 0)

    const discountAmount = Number(appliedCoupon?.discountAmount || 0)
    const finalTotal = Math.max(0, totalPrice + shippingFee - discountAmount)

    useEffect(() => {
        if (appliedCoupon && Number(appliedCoupon.orderValue) !== Number(totalPrice)) {
            setAppliedCoupon(null)
            toast.info('Giỏ hàng thay đổi, vui lòng áp lại mã khuyến mãi.')
        }
    }, [totalPrice, appliedCoupon])

    const loadAvailableCoupons = async (currentOrderValue) => {
        if (!user) {
            setAvailableCoupons([])
            return
        }

        setLoadingCoupons(true)
        try {
            const res = await ClientAxios.get('/api/coupons/available', {
                params: {
                    orderValue: currentOrderValue
                }
            })
            setAvailableCoupons(res.data?.data || [])
        } catch (err) {
            setAvailableCoupons([])
        } finally {
            setLoadingCoupons(false)
        }
    }

    useEffect(() => {
        loadAvailableCoupons(totalPrice)
    }, [totalPrice, user])

    const handleApplyCoupon = async (selectedCode = '') => {
        const codeToApply = (selectedCode || couponCode || '').trim().toUpperCase()

        if (!codeToApply) {
            toast.warn('Bạn chưa nhập mã khuyến mãi.')
            return
        }

        if (totalPrice <= 0) {
            toast.warn('Giỏ hàng trống, chưa thể áp mã.')
            return
        }

        setApplyingCoupon(true)
        try {
            const res = await ClientAxios.post('/api/coupons/validate', {
                code: codeToApply,
                orderValue: totalPrice
            })

            const result = res.data?.data || {}
            setAppliedCoupon(result)
            setCouponCode(result.code || codeToApply)
            toast.success(`Áp mã thành công, giảm ${Number(result.discountAmount || 0).toLocaleString('vi-VN')} VNĐ`)
        } catch (err) {
            setAppliedCoupon(null)
            toast.error(err.response?.data?.message || 'Không áp dụng được mã khuyến mãi')
        } finally {
            setApplyingCoupon(false)
        }
    }

    const handleSelectCoupon = async (coupon) => {
        const selectedCode = String(coupon?.code || '').trim().toUpperCase()
        if (!selectedCode) {
            return
        }

        setCouponCode(selectedCode)
        await handleApplyCoupon(selectedCode)
    }

    const handleRemoveCoupon = () => {
        setAppliedCoupon(null)
        setCouponCode('')
        toast.info('Đã bỏ mã khuyến mãi.')
    }

    const handleOrder = async () => {
        if (!customer.name || !customer.phone || !customer.address) {
            toast.warn('📋 Bạn nhập thiếu thông tin giao hàng rồi kìa! 🥰')
            return
        }

        if (!customer.email) {
            toast.warn('📧 Vui lòng nhập email để nhận xác nhận đơn hàng')
            return
        }

        if (cartItems.length === 0) {
            toast.warn('🛒 Giỏ hàng đang trống, vui lòng thêm món trước khi đặt.')
            return
        }

        setLoading(true)
        try {
            // Try to geocode address if not already done
            if (!deliveryLocation && customer.address) {
                const success = await geocodeAddress(customer.address)
                if (!success) {
                    toast.warn('⚠️ Không tìm được vị trí địa chỉ, nhưng vẫn tiếp tục đặt hàng')
                }
            }

            await ClientAxios.post('/api/orders', {
                items: cartItems.map(item => ({
                    foodId: item._id,
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity || 1
                })),
                totalPrice: finalTotal,
                customerName: customer.name,
                customerEmail: customer.email,
                phone: customer.phone,
                address: customer.address,
                couponCode: appliedCoupon?.code || '',
                deliveryLocation: deliveryLocation || null  // Allow null location
            })

            toast.success('✅ ĐẶT HÀNG THÀNH CÔNG! Chờ tui đi giao cho bạn nha 🛵💨')
            localStorage.removeItem('cart')
            setCartItems([])
            setCustomer({ name: '', email: '', phone: '', address: '' })
            setDeliveryLocation(null)
            setShippingFee(5000)
            setCouponCode('')
            setAppliedCoupon(null)
            navigate('/orders')
        } catch (err) {
            const errorData = err.response?.data || {}
            
            // Translate specific error messages or show raw errors
            if (errorData.errors && Array.isArray(errorData.errors)) {
                errorData.errors.forEach(error => {
                    toast.error(error)
                })
            } else if (errorData.message) {
                toast.error(errorData.message)
            } else {
                toast.error('❌ Có lỗi xảy ra khi đặt hàng. Vui lòng thử lại!')
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <div style={{ textAlign: 'center', padding: '40px 20px', fontFamily: '"Poppins", sans-serif', backgroundColor: '#f0f2f5', minHeight: '100vh' }}>
            
            {/* Thanh điều hướng nhỏ */}
            <div style={{ textAlign: 'left', maxWidth: '800px', margin: '0 auto 20px auto' }}>
                <Link to="/" style={{ color: '#747d8c', textDecoration: 'none', fontSize: '14px' }}>🏠 Trang chủ</Link>
                <span style={{ color: '#a4b0be', margin: '0 10px' }}>/</span>
                <Link to="/menu" style={{ color: '#747d8c', textDecoration: 'none', fontSize: '14px' }}>🛍️ Menu</Link>
                <span style={{ color: '#a4b0be', margin: '0 10px' }}>/</span>
                <span style={{ color: '#2f3542', fontWeight: 'bold', fontSize: '14px' }}>Giỏ hàng</span>
            </div>

            <h2 style={{ marginBottom: '30px', color: '#2f3542', fontWeight: 700, fontSize: '32px' }}>🛒 GIỎ HÀNG CỦA BẠN</h2>
            
            {cartItems.length === 0 ? (
                <div style={{ marginTop: '70px', backgroundColor: 'white', padding: '50px', borderRadius: '20px', display: 'inline-block', boxShadow: '0 10px 30px rgba(0,0,0,0.03)' }}>
                    <div style={{ fontSize: '60px', marginBottom: '20px' }}>🛍️</div>
                    <p style={{ fontSize: '18px', color: '#747d8c', margin: '0 0 20px 0' }}>Giỏ hàng trống trơn hà ní ơi! Quay lại mua đồ đi.</p>
                    <button onClick={() => navigate('/menu')} style={{ padding: '12px 25px', backgroundColor: '#ff4757', color: 'white', border: 'none', borderRadius: '30px', fontWeight: 'bold', cursor: 'pointer', transition: '0.3s', boxShadow: '0 5px 15px rgba(255, 71, 87, 0.2)' }}>
                        Quay lại mua sắm
                    </button>
                </div>
            ) : (
                <div style={{ display: 'flex', gap: '30px', maxWidth: '1100px', margin: '0 auto', flexWrap: 'wrap', justifyContent: 'center' }}>

                    {/* --- CỘT TRÁI: DANH SÁCH MÓN --- */}
                    <div style={{ flex: '1 1 600px', backgroundColor: 'white', padding: '30px', borderRadius: '20px', boxShadow: '0 10px 40px rgba(0,0,0,0.04)', textAlign: 'left' }}>
                        <h4 style={{ margin: '0 0 20px 0', fontSize: '18px', color: '#2f3542', borderBottom: '2px solid #f1f2f6', paddingBottom: '10px' }}>Món ăn đã chọn:</h4>
                        
                        {cartItems.map((item, index) => (
                            <div key={index} style={{ borderBottom: '1px solid #f1f2f6', padding: '20px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '20px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                    <img src={item.image} alt={item.name} style={{ width: '60px', height: '60px', borderRadius: '12px', objectFit: 'cover' }} />
                                    <div>
                                        <span style={{ fontWeight: 'bold', fontSize: '17px', color: '#2f3542', display: 'block' }}>{item.name}</span>
                                        <span style={{ color: '#747d8c', fontSize: '14px' }}>{Number(item.price).toLocaleString()} VNĐ</span>
                                    </div>
                                </div>
                                
                                <div style={{ display: 'flex', alignItems: 'center', gap: '25px' }}>
                                    {/* ✨ BỘ TĂNG GIẢM SỐ LƯỢNG MỚI CHÍNH LÀ ĐÂY */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', backgroundColor: '#f1f2f6', borderRadius: '30px', padding: '3px' }}>
                                        <button 
                                            onClick={() => updateQuantity(item._id, -1)} 
                                            style={{ width: '30px', height: '30px', borderRadius: '50%', border: 'none', backgroundColor: 'white', cursor: 'pointer', fontSize: '18px', fontWeight: 'bold', color: '#57606f', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}
                                        >-</button>
                                        <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#2f3542', minWidth: '20px', textAlign: 'center' }}>{item.quantity || 1}</span>
                                        <button 
                                            onClick={() => updateQuantity(item._id, 1)} 
                                            style={{ width: '30px', height: '30px', borderRadius: '50%', backgroundColor: '#ff4757', color: 'white', border: 'none', cursor: 'pointer', fontSize: '18px', fontWeight: 'bold', boxShadow: '0 2px 5px rgba(255, 71, 87, 0.2)' }}
                                        >+</button>
                                    </div>

                                    <div style={{ textAlign: 'right', minWidth: '120px' }}>
                                        <span style={{ fontWeight: 'bold', fontSize: '17px', color: '#ff4757', display: 'block' }}>
                                            {((Number(item.price) || 0) * (Number(item.quantity) || 1)).toLocaleString()} VNĐ
                                        </span>
                                        {/* ✨ NÚT XÓA: Sửa lỗi font và đổi thành chữ "Xóa" chuẩn */}
                                        <button
                                            onClick={() => removeFromCart(item._id)}
                                            style={{ backgroundColor: 'transparent', color: '#a4b0be', border: 'none', padding: '0', cursor: 'pointer', fontSize: '13px', textDecoration: 'underline', marginTop: '3px' }}
                                            onMouseOver={(e) => e.target.style.color = '#ff4757'}
                                            onMouseOut={(e) => e.target.style.color = '#a4b0be'}
                                        >
                                            Xóa khỏi giỏ
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}

                        <button 
                            onClick={() => { if(window.confirm("Xóa hết giỏ luôn hả ?")) { localStorage.removeItem('cart'); setCartItems([]); toast.info("Đã dọn dẹp giỏ hàng"); } }} 
                            style={{ marginTop: '25px', color: '#a4b0be', border: 'none', background: 'none', cursor: 'pointer', width: '100%', fontSize: '14px', textAlign: 'center' }}
                            onMouseOver={(e) => e.target.style.textDecoration = 'underline'}
                            onMouseOut={(e) => e.target.style.textDecoration = 'none'}
                        >
                            🗑️ Xóa sạch giỏ hàng
                        </button>
                    </div>

                    {/* --- CỘT PHẢI: TỔNG TIỀN & THANH TOÁN --- */}
                    <div style={{ flex: '1 1 350px', backgroundColor: 'white', padding: '30px', borderRadius: '20px', boxShadow: '0 10px 40px rgba(0,0,0,0.04)', textAlign: 'left', height: 'fit-content', position: 'sticky', top: '20px' }}>
                        <h3 style={{ marginTop: 0, fontSize: '20px', color: '#2f3542', marginBottom: '25px' }}>Thanh toán</h3>
                        
                        {/* Form nhập thông tin */}
                        <div style={{ backgroundColor: '#f9f9f9', padding: '20px', borderRadius: '15px', marginBottom: '25px', border: '1px solid #eee' }}>
                            <h4 style={{ marginTop: 0, fontSize: '15px', color: '#57606f', marginBottom: '15px' }}>🛵 Thông tin giao hàng</h4>
                            <input placeholder="Tên của ní" value={customer.name} onChange={e => setCustomer({ ...customer, name: e.target.value })} style={{ width: '100%', padding: '12px 0', marginBottom: '15px', border: 'none', borderBottom: '2px solid #ddd', outline: 'none', fontSize: '15px', backgroundColor: 'transparent' }} onFocus={(e) => e.target.style.borderBottomColor = '#2ed573'} onBlur={(e) => e.target.style.borderBottomColor = '#ddd'} />
                            <input placeholder="Email liên hệ" type="email" value={customer.email} onChange={e => setCustomer({ ...customer, email: e.target.value })} style={{ width: '100%', padding: '12px 0', marginBottom: '15px', border: 'none', borderBottom: '2px solid #ddd', outline: 'none', fontSize: '15px', backgroundColor: 'transparent' }} onFocus={(e) => e.target.style.borderBottomColor = '#2ed573'} onBlur={(e) => e.target.style.borderBottomColor = '#ddd'} />
                            <input placeholder="Số điện thoại" value={customer.phone} onChange={e => setCustomer({ ...customer, phone: e.target.value })} style={{ width: '100%', padding: '12px 0', marginBottom: '15px', border: 'none', borderBottom: '2px solid #ddd', outline: 'none', fontSize: '15px', backgroundColor: 'transparent' }} onFocus={(e) => e.target.style.borderBottomColor = '#2ed573'} onBlur={(e) => e.target.style.borderBottomColor = '#ddd'} />
                            <input
                                ref={addressRef}
                                placeholder="Địa chỉ nhận hàng (ví dụ: 123 Nguyễn Huệ, Hà Nội)"
                                value={customer.address}
                                onChange={handleAddressChange}
                                onBlur={(e) => {
                                    e.target.style.borderBottomColor = '#ddd'
                                    handleAddressBlur()
                                }}
                                style={{ width: '100%', padding: '12px 0', border: 'none', borderBottom: '2px solid #ddd', outline: 'none', fontSize: '15px', backgroundColor: 'transparent' }}
                                onFocus={(e) => e.target.style.borderBottomColor = '#2ed573'}
                            />
                            
                            {/* Manual search button and status indicators */}
                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginTop: '10px' }}>
                                {customer.address && !deliveryLocation && (
                                    <button
                                        onClick={() => geocodeAddress(customer.address)}
                                        style={{
                                            padding: '6px 16px',
                                            backgroundColor: '#ff7675',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '8px',
                                            cursor: 'pointer',
                                            fontSize: '13px',
                                            fontWeight: 'bold'
                                        }}
                                        onMouseOver={(e) => e.target.style.backgroundColor = '#ff5252'}
                                        onMouseOut={(e) => e.target.style.backgroundColor = '#ff7675'}
                                    >
                                        🔍 Tìm vị trí
                                    </button>
                                )}
                                
                                {deliveryLocation && (
                                    <span style={{ fontSize: '13px', color: '#2ed573', fontWeight: 'bold' }}>
                                        ✅ Đã tìm thấy vị trí
                                    </span>
                                )}
                                
                                {!deliveryLocation && customer.address && (
                                    <span style={{ fontSize: '13px', color: '#ff7675', fontWeight: 'bold' }}>
                                        ⚠️ Chưa tìm được
                                    </span>
                                )}
                            </div>
                            
                            {deliveryLocation && (
                                <p style={{ marginTop: '8px', fontSize: '13px', color: '#2ed573' }}>
                                    ✅ Vị trí đã tìm thấy! Phí giao hàng: <strong>{shippingFee.toLocaleString()} VNĐ</strong>
                                </p>
                            )}
                            {!deliveryLocation && customer.address && (
                                <p style={{ marginTop: '8px', fontSize: '13px', color: '#ff7675' }}>
                                    💡 Không tìm được vị trí tự động, nhưng vẫn có thể đặt hàng. Nhấn nút "🔍 Tìm vị trí" để thử lại.
                                </p>
                            )}
                            {!customer.address && (
                                <p style={{ marginTop: '8px', fontSize: '13px', color: '#57606f' }}>
                                    📍 Nhập địa chỉ để tính lại phí giao hàng (mặc định 5.000 VNĐ)
                                </p>
                            )}
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                            <span style={{ fontSize: '15px', color: '#747d8c' }}>Tạm tính:</span>
                            <span style={{ fontSize: '16px', color: '#2f3542', fontWeight: 'bold' }}>{totalPrice.toLocaleString()} VNĐ</span>
                        </div>

                        <div style={{ marginBottom: '16px', padding: '12px', border: '1px dashed #dfe4ea', borderRadius: '12px', backgroundColor: '#fafafa' }}>
                            <p style={{ margin: '0 0 8px', fontSize: '14px', color: '#57606f', fontWeight: 'bold' }}>🎁 Mã khuyến mãi</p>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <input
                                    value={couponCode}
                                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                    placeholder="Nhập mã giảm giá"
                                    style={{ flex: 1, padding: '10px 12px', border: '1px solid #dfe4ea', borderRadius: '10px', outline: 'none', fontSize: '14px' }}
                                />
                                <button
                                    type="button"
                                    onClick={handleApplyCoupon}
                                    disabled={applyingCoupon}
                                    style={{ padding: '10px 12px', border: 'none', borderRadius: '10px', backgroundColor: '#3742fa', color: 'white', fontWeight: 'bold', cursor: applyingCoupon ? 'not-allowed' : 'pointer' }}
                                >
                                    {applyingCoupon ? 'Đang áp...' : 'Áp dụng'}
                                </button>
                            </div>
                            {appliedCoupon && (
                                <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ color: '#2ed573', fontSize: '13px', fontWeight: 'bold' }}>
                                        ✅ Đã áp mã {appliedCoupon.code} (-{discountAmount.toLocaleString('vi-VN')} VNĐ)
                                    </span>
                                    <button
                                        type="button"
                                        onClick={handleRemoveCoupon}
                                        style={{ border: 'none', background: 'transparent', color: '#ff4757', fontSize: '13px', textDecoration: 'underline', cursor: 'pointer' }}
                                    >
                                        Bỏ mã
                                    </button>
                                </div>
                            )}

                            <div style={{ marginTop: '10px' }}>
                                <p style={{ margin: '0 0 8px', fontSize: '13px', color: '#747d8c' }}>Mã đang có:</p>
                                {loadingCoupons ? (
                                    <span style={{ fontSize: '13px', color: '#57606f' }}>Đang tải mã khuyến mãi...</span>
                                ) : availableCoupons.length === 0 ? (
                                    <span style={{ fontSize: '13px', color: '#a4b0be' }}>Hiện chưa có mã phù hợp đơn hàng của bạn.</span>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        {availableCoupons.map((coupon) => {
                                            const isSelected = (couponCode || '').trim().toUpperCase() === String(coupon.code || '').trim().toUpperCase()
                                            return (
                                                <button
                                                    key={coupon._id || coupon.code}
                                                    type="button"
                                                    onClick={() => handleSelectCoupon(coupon)}
                                                    style={{
                                                        textAlign: 'left',
                                                        border: isSelected ? '1px solid #2ed573' : '1px solid #dfe4ea',
                                                        backgroundColor: isSelected ? '#ecfff4' : '#fff',
                                                        borderRadius: '10px',
                                                        padding: '10px',
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px' }}>
                                                        <strong style={{ color: '#2f3542' }}>{coupon.code}</strong>
                                                        <span style={{ fontSize: '12px', color: '#57606f' }}>
                                                            {coupon.discountType === 'percent' ? `${coupon.discountValue}%` : `${Number(coupon.discountValue || 0).toLocaleString('vi-VN')} VNĐ`}
                                                        </span>
                                                    </div>
                                                    <div style={{ marginTop: '4px', fontSize: '12px', color: '#747d8c' }}>
                                                        Đơn tối thiểu: {Number(coupon.minOrderValue || 0).toLocaleString('vi-VN')} VNĐ | HSD: {coupon.expiresAt ? new Date(coupon.expiresAt).toLocaleDateString('vi-VN') : '-'}
                                                    </div>
                                                </button>
                                            )
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <span style={{ fontSize: '15px', color: '#747d8c' }}>Phí giao hàng:</span>
                            <span style={{ fontSize: '15px', color: '#2ed573', fontWeight: 'bold' }}>
                                {shippingFee > 0 ? `${shippingFee.toLocaleString()} VNĐ` : 'Miễn phí hoặc chưa tính'}
                            </span>
                        </div>

                        {discountAmount > 0 && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                <span style={{ fontSize: '15px', color: '#747d8c' }}>Giảm giá:</span>
                                <span style={{ fontSize: '15px', color: '#ff4757', fontWeight: 'bold' }}>
                                    -{discountAmount.toLocaleString('vi-VN')} VNĐ
                                </span>
                            </div>
                        )}

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', paddingTop: '20px', borderTop: '2px dashed #eee' }}>
                            <span style={{ fontSize: '18px', color: '#2f3542', fontWeight: 'bold' }}>Tổng cộng:</span>
                            <h3 style={{ color: '#ff4757', fontSize: '28px', margin: 0, fontWeight: 800 }}>
                                {finalTotal.toLocaleString('vi-VN')} VNĐ
                            </h3>
                        </div>

                        <button 
                            onClick={handleOrder} 
                            disabled={loading}
                            style={{ width: '100%', padding: '18px', backgroundColor: '#2ed573', color: 'white', border: 'none', borderRadius: '15px', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: 'bold', fontSize: '18px', marginTop: '25px', boxShadow: '0 8px 20px rgba(46, 213, 115, 0.3)', transition: '0.3s' }}
                            onMouseOver={(e) => { if (!loading) e.target.style.backgroundColor = '#26af61' }}
                            onMouseOut={(e) => { if (!loading) e.target.style.backgroundColor = '#2ed573' }}
                        >
                            {loading ? 'Đang đặt hàng...' : '🚀 ĐẶT HÀNG NGAY'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Cart


