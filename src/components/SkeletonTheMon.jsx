import React from 'react';
import './FoodCardSkeleton.css';

/**
 * FoodCardSkeleton Component
 * Shows loading placeholder while food data is being fetched
 */
const FoodCardSkeleton = () => {
  return (
    <div className="food-card-skeleton">
      <div className="skeleton-image" />
      <div className="skeleton-text skeleton-title" />
      <div className="skeleton-text skeleton-description" />
      <div className="skeleton-text skeleton-price" />
    </div>
  );
};

/**
 * Grid of skeleton cards for loading state
 */
export const FoodCardSkeletonGrid = ({ count = 6 }) => {
  return (
    <div className="food-grid">
      {Array.from({ length: count }).map((_, index) => (
        <FoodCardSkeleton key={index} />
      ))}
    </div>
  );
};

export default FoodCardSkeleton;
