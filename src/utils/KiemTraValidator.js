/**
 * Form Validation Utilities
 * Provides real-time validation functions for common fields
 */

// Email validation
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) {
    return { isValid: false, error: 'Email không được để trống' };
  }
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Email không hợp lệ' };
  }
  return { isValid: true, error: '' };
};

// Phone validation (Vietnam format)
export const validatePhone = (phone) => {
  const phoneRegex = /^(0|\+84)[0-9]{9,10}$/;
  if (!phone) {
    return { isValid: false, error: 'Số điện thoại không được để trống' };
  }
  if (!phoneRegex.test(phone)) {
    return { isValid: false, error: 'Số điện thoại không hợp lệ (định dạng: 0xxxxxxxxx)' };
  }
  return { isValid: true, error: '' };
};

// Name validation
export const validateName = (name) => {
  if (!name || name.trim().length === 0) {
    return { isValid: false, error: 'Tên không được để trống' };
  }
  if (name.trim().length < 2) {
    return { isValid: false, error: 'Tên phải có ít nhất 2 ký tự' };
  }
  if (name.trim().length > 50) {
    return { isValid: false, error: 'Tên không được vượt quá 50 ký tự' };
  }
  return { isValid: true, error: '' };
};

// Password validation
export const validatePassword = (password) => {
  if (!password) {
    return { isValid: false, error: 'Mật khẩu không được để trống' };
  }
  if (password.length < 6) {
    return { isValid: false, error: 'Mật khẩu phải có ít nhất 6 ký tự' };
  }
  if (password.length > 100) {
    return { isValid: false, error: 'Mật khẩu không được vượt quá 100 ký tự' };
  }
  return { isValid: true, error: '' };
};

// Address validation
export const validateAddress = (address) => {
  if (!address || address.trim().length === 0) {
    return { isValid: false, error: 'Địa chỉ không được để trống' };
  }
  if (address.trim().length < 5) {
    return { isValid: false, error: 'Địa chỉ phải có ít nhất 5 ký tự' };
  }
  if (address.trim().length > 200) {
    return { isValid: false, error: 'Địa chỉ không được vượt quá 200 ký tự' };
  }
  return { isValid: true, error: '' };
};

// City/Province validation
export const validateCity = (city) => {
  if (!city || city.trim().length === 0) {
    return { isValid: false, error: 'Thành phố không được để trống' };
  }
  return { isValid: true, error: '' };
};

// Postal code validation (if needed)
export const validatePostalCode = (zipCode) => {
  const zipRegex = /^[0-9]{5}$/;
  if (!zipCode) {
    return { isValid: false, error: 'Mã bưu điện không được để trống' };
  }
  if (!zipRegex.test(zipCode)) {
    return { isValid: false, error: 'Mã bưu điện không hợp lệ (định dạng: 5 chữ số)' };
  }
  return { isValid: true, error: '' };
};

// Notes/Comments validation
export const validateNotes = (notes, maxLength = 500) => {
  if (notes && notes.length > maxLength) {
    return { 
      isValid: false, 
      error: `Ghi chú không được vượt quá ${maxLength} ký tự` 
    };
  }
  return { isValid: true, error: '' };
};

// Complete form validation
export const validateForm = (formData) => {
  const errors = {};
  let isValid = true;

  // Validate required fields
  if (formData.name !== undefined) {
    const nameValidation = validateName(formData.name);
    if (!nameValidation.isValid) {
      errors.name = nameValidation.error;
      isValid = false;
    }
  }

  if (formData.email !== undefined) {
    const emailValidation = validateEmail(formData.email);
    if (!emailValidation.isValid) {
      errors.email = emailValidation.error;
      isValid = false;
    }
  }

  if (formData.phone !== undefined) {
    const phoneValidation = validatePhone(formData.phone);
    if (!phoneValidation.isValid) {
      errors.phone = phoneValidation.error;
      isValid = false;
    }
  }

  if (formData.address !== undefined) {
    const addressValidation = validateAddress(formData.address);
    if (!addressValidation.isValid) {
      errors.address = addressValidation.error;
      isValid = false;
    }
  }

  if (formData.password !== undefined) {
    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.isValid) {
      errors.password = passwordValidation.error;
      isValid = false;
    }
  }

  if (formData.city !== undefined) {
    const cityValidation = validateCity(formData.city);
    if (!cityValidation.isValid) {
      errors.city = cityValidation.error;
      isValid = false;
    }
  }

  if (formData.notes !== undefined) {
    const notesValidation = validateNotes(formData.notes);
    if (!notesValidation.isValid) {
      errors.notes = notesValidation.error;
      isValid = false;
    }
  }

  return { isValid, errors };
};

// Format phone number for display
export const formatPhoneDisplay = (phone) => {
  if (!phone) return '';
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`;
  }
  return phone;
};

// Debounce validation for real-time checks
export const debounceValidation = (validator, delay = 500) => {
  let timeoutId;
  return (value) => {
    return new Promise((resolve) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        resolve(validator(value));
      }, delay);
    });
  };
};
