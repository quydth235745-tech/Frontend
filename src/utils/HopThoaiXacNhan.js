import React from 'react';
import ReactDOM from 'react-dom';
import styles from '../styles/ConfirmDialog.module.css';

/**
 * Custom Confirmation Dialog Component
 * Provides a styled modal for user confirmations
 */
class ConfirmDialog extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isOpen: false,
    };
  }

  show = (options = {}) => {
    return new Promise((resolve) => {
      this.setState({
        isOpen: true,
        title: options.title || 'Xác nhận',
        message: options.message || 'Bạn có chắc chắn?',
        confirmText: options.confirmText || 'Xác nhận',
        cancelText: options.cancelText || 'Hủy',
        isDangerous: options.isDangerous || false,
        onConfirm: () => {
          this.setState({ isOpen: false });
          resolve(true);
        },
        onCancel: () => {
          this.setState({ isOpen: false });
          resolve(false);
        },
      });
    });
  };

  handleConfirm = () => {
    this.state.onConfirm?.();
  };

  handleCancel = () => {
    this.state.onCancel?.();
  };

  handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      this.handleCancel();
    }
  };

  render() {
    const { isOpen, title, message, confirmText, cancelText, isDangerous } =
      this.state;

    if (!isOpen) return null;

    return ReactDOM.createPortal(
      <div className={styles.backdrop} onClick={this.handleBackdropClick}>
        <div className={styles.dialog}>
          <div className={styles.header}>
            <h2 className={styles.title}>{title}</h2>
          </div>

          <div className={styles.body}>
            <p className={styles.message}>{message}</p>
          </div>

          <div className={styles.footer}>
            <button className={styles.cancelButton} onClick={this.handleCancel}>
              {cancelText}
            </button>
            <button
              className={`${styles.confirmButton} ${
                isDangerous ? styles.danger : ''
              }`}
              onClick={this.handleConfirm}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>,
      document.body
    );
  }
}

let confirmDialogInstance = null;

/**
 * Initialize the confirm dialog instance
 * Call this once in your App component
 */
export const initConfirmDialog = () => {
  if (!confirmDialogInstance) {
    const container = document.createElement('div');
    document.body.appendChild(container);
    confirmDialogInstance = ReactDOM.createRoot(container).render(
      <ConfirmDialog ref={(ref) => (confirmDialogInstance = ref)} />
    );
  }
};

/**
 * Show a confirmation dialog
 * @param {Object} options - Configuration options
 * @param {string} options.title - Dialog title
 * @param {string} options.message - Dialog message
 * @param {string} options.confirmText - Confirm button text
 * @param {string} options.cancelText - Cancel button text
 * @param {boolean} options.isDangerous - Show as dangerous action (red button)
 * @returns {Promise<boolean>} - Returns true if confirmed, false if cancelled
 */
export const confirm = async (options = {}) => {
  if (!confirmDialogInstance) {
    console.error('ConfirmDialog not initialized. Call initConfirmDialog() in App component.');
    return false;
  }
  return confirmDialogInstance.show(options);
};

/**
 * Predefined confirmation dialogs
 */
export const confirmDialogs = {
  delete: (itemName = 'mục này') =>
    confirm({
      title: 'Xóa mục',
      message: `Bạn có chắc chắn muốn xóa ${itemName}? Hành động này không thể hoàn tác.`,
      confirmText: 'Xóa',
      cancelText: 'Hủy',
      isDangerous: true,
    }),

  logout: () =>
    confirm({
      title: 'Đăng xuất',
      message: 'Bạn có chắc chắn muốn đăng xuất?',
      confirmText: 'Đăng xuất',
      cancelText: 'Hủy',
    }),

  clearCart: () =>
    confirm({
      title: 'Xóa giỏ hàng',
      message: 'Bạn có chắc chắn muốn xóa tất cả mục trong giỏ hàng?',
      confirmText: 'Xóa',
      cancelText: 'Hủy',
      isDangerous: true,
    }),

  cancelOrder: (orderId) =>
    confirm({
      title: 'Hủy đơn hàng',
      message: `Bạn có chắc chắn muốn hủy đơn hàng ${orderId}?`,
      confirmText: 'Hủy đơn',
      cancelText: 'Không',
      isDangerous: true,
    }),

  unsavedChanges: () =>
    confirm({
      title: 'Những thay đổi chưa lưu',
      message: 'Bạn có những thay đổi chưa lưu. Bạn có chắc chắn muốn rời khỏi?',
      confirmText: 'Rời khỏi',
      cancelText: 'Tiếp tục chỉnh sửa',
      isDangerous: true,
    }),
};

/**
 * Hook to use confirmation dialog in functional components
 */
export const useConfirm = () => {
  return {
    confirm,
    confirmDialogs,
  };
};
