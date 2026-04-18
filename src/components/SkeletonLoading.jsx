import React from 'react';
import styles from '../styles/Skeleton.module.css';

/**
 * FoodCardSkeleton Component
 * Displays loading skeleton for food cards with smooth animations
 */
const FoodCardSkeleton = ({ count = 6 }) => {
  return (
    <div className={styles.skeletonGrid}>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className={styles.skeletonCard}>
          {/* Image skeleton */}
          <div className={styles.skeletonImage} />

          {/* Content skeleton */}
          <div className={styles.skeletonContent}>
            {/* Name skeleton */}
            <div className={styles.skeletonLine} style={{ width: '85%' }} />

            {/* Description skeleton */}
            <div className={styles.skeletonLine} style={{ width: '100%' }} />
            <div className={styles.skeletonLine} style={{ width: '75%' }} />

            {/* Footer skeleton */}
            <div className={styles.skeletonFooter}>
              <div
                className={styles.skeletonLine}
                style={{ width: '50px', height: '20px' }}
              />
              <div
                className={styles.skeletonLine}
                style={{ width: '60px', height: '20px' }}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

/**
 * OrderItemSkeleton Component
 * Displays loading skeleton for order items with smooth animations
 */
export const OrderItemSkeleton = ({ count = 3 }) => {
  return (
    <div className={styles.skeletonList}>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className={styles.skeletonOrderItem}>
          {/* Image */}
          <div
            className={styles.skeletonLine}
            style={{ width: '60px', height: '60px', borderRadius: '8px' }}
          />

          {/* Item info */}
          <div className={styles.skeletonOrderItemInfo}>
            <div className={styles.skeletonLine} style={{ width: '120px' }} />
            <div
              className={styles.skeletonLine}
              style={{ width: '80px', marginTop: '8px' }}
            />
          </div>

          {/* Price */}
          <div
            className={styles.skeletonLine}
            style={{ width: '50px', height: '20px' }}
          />
        </div>
      ))}
    </div>
  );
};

/**
 * FormSkeleton Component
 * Displays loading skeleton for form fields
 */
export const FormSkeleton = () => {
  return (
    <div className={styles.skeletonForm}>
      <div className={styles.formGroup}>
        <div
          className={styles.skeletonLine}
          style={{ width: '80px', height: '16px', marginBottom: '8px' }}
        />
        <div
          className={styles.skeletonLine}
          style={{ height: '40px', width: '100%' }}
        />
      </div>

      <div className={styles.formGroup}>
        <div
          className={styles.skeletonLine}
          style={{ width: '80px', height: '16px', marginBottom: '8px' }}
        />
        <div
          className={styles.skeletonLine}
          style={{ height: '40px', width: '100%' }}
        />
      </div>

      <div className={styles.formGroup}>
        <div
          className={styles.skeletonLine}
          style={{ width: '80px', height: '16px', marginBottom: '8px' }}
        />
        <div
          className={styles.skeletonLine}
          style={{ height: '100px', width: '100%' }}
        />
      </div>

      <div
        className={styles.skeletonLine}
        style={{ height: '44px', width: '100%', marginTop: '16px' }}
      />
    </div>
  );
};

/**
 * DetailPageSkeleton Component
 * Displays loading skeleton for detail pages
 */
export const DetailPageSkeleton = () => {
  return (
    <div className={styles.skeletonDetailPage}>
      {/* Image section */}
      <div className={styles.skeletonDetailImage} />

      {/* Content section */}
      <div className={styles.skeletonDetailContent}>
        {/* Title */}
        <div
          className={styles.skeletonLine}
          style={{ width: '60%', height: '28px', marginBottom: '16px' }}
        />

        {/* Rating and price */}
        <div className={styles.skeletonDetailRow}>
          <div
            className={styles.skeletonLine}
            style={{ width: '100px', height: '20px' }}
          />
          <div
            className={styles.skeletonLine}
            style={{ width: '80px', height: '20px' }}
          />
        </div>

        {/* Description */}
        <div style={{ marginTop: '16px' }}>
          <div className={styles.skeletonLine} style={{ width: '100%' }} />
          <div
            className={styles.skeletonLine}
            style={{ width: '90%', marginTop: '8px' }}
          />
          <div
            className={styles.skeletonLine}
            style={{ width: '80%', marginTop: '8px' }}
          />
        </div>

        {/* Buttons */}
        <div className={styles.skeletonDetailButtons}>
          <div
            className={styles.skeletonLine}
            style={{ height: '44px', flex: 1 }}
          />
          <div
            className={styles.skeletonLine}
            style={{ height: '44px', flex: 1 }}
          />
        </div>
      </div>
    </div>
  );
};

export default FoodCardSkeleton;
