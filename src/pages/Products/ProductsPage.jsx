// src/pages/Products/ProductsPage.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import './ProductsPage.css';
import { BiMobile, BiLaptop, BiCloset } from 'react-icons/bi';
import { IoWatchOutline, IoHeadsetOutline, IoCameraOutline } from 'react-icons/io5';

// Import icons from a proper icon library (you'll need to install react-icons)
// import { FaMobileAlt, FaLaptop, FaTshirt, FaClock, FaHeadphones, FaCamera } from 'react-icons/fa';

// Import other sections (placeholders for now)
// import TrendingDeals from './components/Sections/TrendingDeals';
// import FindDeals from './components/Sections/FindDeals';
// import Stats from './components/Sections/Stats';
// import UserTestimonials from './components/Sections/UserTestimonials';

const ProductsPage = () => {
  const categories = [
    {
      id: 1,
      title: 'Electronics & Gadgets',
      subtitle: 'Latest Tech Deals',
      icon: <BiMobile className="category-icon" />,
      path: '/products/electronics',
      count: '2,345 items'
    },
    {
      id: 2,
      title: 'Laptops & Computers',
      subtitle: 'Best Computing Deals',
      icon: <BiLaptop className="category-icon" />,
      path: '/products/laptops',
      count: '1,278 items'
    },
    {
      id: 3,
      title: 'Fashion & Apparel',
      subtitle: 'Trending Fashion',
      icon: <BiCloset className="category-icon" />,
      path: '/products/fashion',
      count: '3,456 items'
    },
    {
      id: 4,
      title: 'Watches & Accessories',
      subtitle: 'Luxury Collection',
      icon: <IoWatchOutline className="category-icon" />,
      path: '/products/watches',
      count: '892 items'
    },
    {
      id: 5,
      title: 'Audio & Headphones',
      subtitle: 'Premium Sound',
      icon: <IoHeadsetOutline className="category-icon" />,
      path: '/products/audio',
      count: '567 items'
    },
    {
      id: 6,
      title: 'Photography',
      subtitle: 'Professional Gear',
      icon: <IoCameraOutline className="category-icon" />,
      path: '/products/photography',
      count: '789 items'
    }
  ];

  const trendingDeals = [
    {
      id: 1,
      title: 'iPhone 14 Pro',
      discount: '12%',
      originalPrice: '₹129,900',
      discountedPrice: '₹114,900',
      image: 'https://images.unsplash.com/photo-1678652197831-2d180705cd2c?w=800&auto=format&fit=crop&q=60',
      savings: 'Save ₹15,000',
      rating: 4.8,
      reviews: 256
    },
    {
      id: 2,
      title: 'Sony WH-1000XM4',
      discount: '25%',
      originalPrice: '₹29,990',
      discountedPrice: '₹22,490',
      image: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=800&auto=format&fit=crop&q=60',
      savings: 'Save ₹7,500',
      rating: 4.9,
      reviews: 1205
    },
    {
      id: 3,
      title: 'Nike Air Max 270',
      discount: '30%',
      originalPrice: '₹12,995',
      discountedPrice: '₹9,095',
      image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=60',
      savings: 'Save ₹3,900',
      rating: 4.7,
      reviews: 892
    },
    {
      id: 4,
      title: 'Canon EOS R6',
      discount: '15%',
      originalPrice: '₹215,995',
      discountedPrice: '₹183,595',
      image: 'https://images.unsplash.com/photo-1621520291095-aa6c7137f048?w=800&auto=format&fit=crop&q=60',
      savings: 'Save ₹32,400',
      rating: 4.9,
      reviews: 328
    }
  ];

  const dealCategories = [
    {
      id: 1,
      title: 'Electronics',
      subtitle: 'Up to 40% Off',
      image: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=800&auto=format&fit=crop&q=60',
      itemCount: '2,345+ items'
    },
    {
      id: 2,
      title: 'Fashion',
      subtitle: 'Up to 60% Off',
      image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=800&auto=format&fit=crop&q=60',
      itemCount: '3,456+ items'
    },
    {
      id: 3,
      title: 'Home',
      subtitle: 'Up to 35% Off',
      image: 'https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=800&auto=format&fit=crop&q=60',
      itemCount: '1,789+ items'
    }
  ];

  const stats = [
    {
      id: 1,
      value: '12k+',
      label: 'Products Tracked',
      icon: '📦',
      description: 'Daily price updates'
    },
    {
      id: 2,
      value: '₹2,100',
      label: 'Avg Savings',
      icon: '💰',
      description: 'Per purchase'
    },
    {
      id: 3,
      value: '1.5M+',
      label: 'Price Checks',
      icon: '🔍',
      description: 'Last 30 days'
    }
  ];

  const testimonials = [
    {
      id: 1,
      name: 'Rahul M.',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=60',
      text: 'Saved ₹15,000 on my new laptop purchase. Amazing deals!',
      rating: 5
    },
    {
      id: 2,
      name: 'Priya S.',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=60',
      text: 'The price tracking feature is incredibly useful. Highly recommended!',
      rating: 5
    },
    {
      id: 3,
      name: 'Amit K.',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=60',
      text: 'Best place to find electronics deals. Regular price drops notifications are great.',
      rating: 4
    }
  ];

  return (
    <div className="products-page">
      <section className="categories-section">
        <h2 className="section-title">Trending & Top Categories</h2>
        <div className="categories-grid">
          {categories.map(category => (
            <Link to={category.path} key={category.id} className="category-card">
              {category.icon}
              <div className="category-info">
                <h3>{category.title}</h3>
                <p>{category.subtitle}</p>
                <span className="item-count">{category.count}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="trending-deals-section">
        <h2 className="section-title">Trending & Top Deals This Week</h2>
        <div className="deals-grid">
          {trendingDeals.map(deal => (
            <div key={deal.id} className="deal-card">
              <div className="deal-image-container">
                <img src={deal.image} alt={deal.title} />
                <span className="discount-badge">{deal.discount}</span>
              </div>
              <div className="deal-info">
                <h3>{deal.title}</h3>
                <div className="price-container">
                  <span className="discounted-price">{deal.discountedPrice}</span>
                  <span className="original-price">{deal.originalPrice}</span>
                </div>
                <div className="rating-container">
                  <div className="stars">
                    {'★'.repeat(Math.floor(deal.rating))}
                    {'☆'.repeat(5 - Math.floor(deal.rating))}
                  </div>
                  <span className="review-count">({deal.reviews})</span>
                </div>
                <span className="savings-text">{deal.savings}</span>
                <button className="compare-button">Compare Prices</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="find-deals-section">
        <h2 className="section-title">Find Deals by Category</h2>
        <div className="deal-categories-grid">
          {dealCategories.map(category => (
            <Link to={`/category/${category.id}`} key={category.id} className="deal-category-card">
              <img src={category.image} alt={category.title} />
              <div className="category-overlay">
                <h3>{category.title}</h3>
                <p className="category-subtitle">{category.subtitle}</p>
                <span className="category-item-count">{category.itemCount}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="stats-section">
        <h2 className="section-title">Our Impact</h2>
        <div className="stats-grid">
          {stats.map(stat => (
            <div key={stat.id} className="stat-card">
              <span className="stat-icon">{stat.icon}</span>
              <h3 className="stat-value">{stat.value}</h3>
              <p className="stat-label">{stat.label}</p>
              <p className="stat-description">{stat.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="testimonials-section">
        <h2 className="section-title">What Users Are Saying</h2>
        <div className="testimonials-grid">
          {testimonials.map(testimonial => (
            <div key={testimonial.id} className="testimonial-card">
              <div className="testimonial-header">
                <img src={testimonial.avatar} alt={testimonial.name} className="testimonial-avatar" />
                <div className="testimonial-info">
                  <h4>{testimonial.name}</h4>
                  <div className="testimonial-rating">
                    {'★'.repeat(testimonial.rating)}
                    {'☆'.repeat(5 - testimonial.rating)}
                  </div>
                </div>
              </div>
              <p className="testimonial-text">"{testimonial.text}"</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default ProductsPage;