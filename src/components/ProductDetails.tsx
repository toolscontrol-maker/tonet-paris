"use client";

import { useState } from "react";

export default function ProductDetails() {
  const [activeTab, setActiveTab] = useState<string | null>(null);

  const toggleTab = (tab: string) => {
    setActiveTab(activeTab === tab ? null : tab);
  };

  return (
    <div className="product-details-accordion">
      <div className="accordion-item">
        <button className="accordion-header" onClick={() => toggleTab('shipping')}>
          Shipping & Returns
          <span className={`icon ${activeTab === 'shipping' ? 'open' : ''}`}>+</span>
        </button>
        <div className={`accordion-content ${activeTab === 'shipping' ? 'expanded' : ''}`}>
          <div className="inner-content">
            <p>We provide worldwide shipping in specialized crate packaging to ensure the artwork arrives in pristine condition. Expected delivery within 7-14 business days.</p>
            <p>14-day return policy no questions asked.</p>
          </div>
        </div>
      </div>

      <div className="accordion-item">
        <button className="accordion-header" onClick={() => toggleTab('reviews')}>
          Reviews (3)
          <span className={`icon ${activeTab === 'reviews' ? 'open' : ''}`}>+</span>
        </button>
        <div className={`accordion-content ${activeTab === 'reviews' ? 'expanded' : ''}`}>
          <div className="inner-content reviews-list">
            <div className="review">
              <strong>Elena M.</strong>
              <p>Stunning geometry. Completely changed the vibe of my living room.</p>
            </div>
            <div className="review">
              <strong>Marcus T.</strong>
              <p>Incredible texture work, minimal but profound.</p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .product-details-accordion {
          border-top: 1px solid var(--border-color);
          margin-top: var(--spacing-md);
        }
        .accordion-item {
          border-bottom: 1px solid var(--border-color);
        }
        .accordion-header {
          width: 100%;
          background: transparent;
          color: var(--text-color);
          text-align: left;
          padding: var(--spacing-md) 0;
          font-size: 1.1rem;
          font-weight: 400;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border: none;
        }
        .accordion-header:hover {
          opacity: 0.7;
          background: transparent;
        }
        .accordion-header .icon {
          font-size: 1.5rem;
          font-weight: 300;
          transition: transform var(--transition-normal);
        }
        .accordion-header .icon.open {
          transform: rotate(45deg);
        }
        
        .accordion-content {
          display: grid;
          grid-template-rows: 0fr;
          transition: grid-template-rows var(--transition-normal);
          overflow: hidden;
        }
        .accordion-content.expanded {
          grid-template-rows: 1fr;
        }
        .inner-content {
          min-height: 0;
          padding-bottom: var(--spacing-md);
          color: var(--secondary-text-color);
          font-size: 0.95rem;
          line-height: 1.6;
        }
        .inner-content p {
          margin-bottom: var(--spacing-sm);
        }
        .reviews-list .review {
          margin-bottom: var(--spacing-md);
        }
        .reviews-list strong {
          display: block;
          color: var(--text-color);
          margin-bottom: 4px;
        }
      `}</style>
    </div>
  );
}
