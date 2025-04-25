// src/pages/Products/ProductsPage.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './ProductsPage.css';
import { BiMobile, BiLaptop, BiCloset } from 'react-icons/bi';
import { IoWatchOutline, IoHeadsetOutline, IoCameraOutline } from 'react-icons/io5';
import ProductCarousel from '../../components/ProductCarousel/ProductCarousel';
import { trendingDeals } from '../../data/products';

// Import icons from a proper icon library (you'll need to install react-icons)
// import { FaMobileAlt, FaLaptop, FaTshirt, FaClock, FaHeadphones, FaCamera } from 'react-icons/fa';

// Import other sections (placeholders for now)
// import TrendingDeals from './components/Sections/TrendingDeals';
// import FindDeals from './components/Sections/FindDeals';
// import Stats from './components/Sections/Stats';
// import UserTestimonials from './components/Sections/UserTestimonials';

const ProductsPage = () => {
  const [displayedProducts, setDisplayedProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const productsPerPage = 8;

  useEffect(() => {
    loadMoreProducts();
    // Add scroll event listener
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const loadMoreProducts = () => {
    if (loading || !hasMore) return;

    setLoading(true);
    const startIndex = (page - 1) * productsPerPage;
    const endIndex = startIndex + productsPerPage;
    const newProducts = trendingDeals.slice(startIndex, endIndex);

    if (newProducts.length === 0) {
      setHasMore(false);
    } else {
      setDisplayedProducts(prev => [...prev, ...newProducts]);
      setPage(prev => prev + 1);
    }
    setLoading(false);
  };

  const handleScroll = () => {
    if (
      window.innerHeight + document.documentElement.scrollTop
      === document.documentElement.offsetHeight
    ) {
      loadMoreProducts();
    }
  };

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
        <ProductCarousel products={displayedProducts} />
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