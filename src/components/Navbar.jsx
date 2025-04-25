import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, ChevronDown, Search, Smartphone, Laptop, ShoppingBag, Home, Watch, Headphones, Camera, Trash2, Clock, TrendingUp } from 'lucide-react'; // Import icons and Search icon
import styles from './Navbar.module.css'; // Import CSS Module

const categories = [
  { name: 'Electronics & Gadgets', icon: <Smartphone size={18} /> },
  { name: 'Laptops & Computers', icon: <Laptop size={18} /> },
  { name: 'Fashion & Apparel', icon: <ShoppingBag size={18} /> },
  { name: 'Home & Furniture', icon: <Home size={18} /> },
  { name: 'Watches & Accessories', icon: <Watch size={18} /> },
  { name: 'Audio & Headphones', icon: <Headphones size={18} /> },
  { name: 'Cameras & Photography', icon: <Camera size={18} /> },
];

const trendingSearches = [
  "Latest Smartphones",
  "Wireless Earbuds",
  "Gaming Laptops",
  "Smart Watches",
  "4K Cameras"
];

const recentSearches = [
  "iPhone 15 Pro",
  "Samsung Galaxy",
  "MacBook Air",
  "Sony Headphones"
];

// Navbar component
function Navbar() {
  // State for mobile menu visibility
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  // State for dropdown visibility
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  // State for search input expansion
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  // State for search query
  const [searchQuery, setSearchQuery] = useState('');
  // Ref for the dropdown to detect outside clicks
  const dropdownRef = useRef(null);
  // Ref for the search container to detect outside clicks
  const searchRef = useRef(null);
  // Ref for the search input to focus it when expanded
  const searchInputRef = useRef(null);
  const [showRecommendations, setShowRecommendations] = useState(false);

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    setIsDropdownOpen(false); // Close dropdown when opening/closing mobile menu
    setIsSearchExpanded(false); // Close search when opening/closing mobile menu
  };

  // Toggle dropdown menu
  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
    setIsSearchExpanded(false); // Close search when opening dropdown
  };

  // Toggle search expansion
  const toggleSearch = () => {
    setIsSearchExpanded(!isSearchExpanded);
    if (!isSearchExpanded) {
      setShowRecommendations(true);
    }
  };

  // Close dropdown or search if clicked outside
  useEffect(() => {
    function handleClickOutside(event) {
      // Close dropdown if click is outside dropdown ref
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      // Close search if click is outside search ref AND search is expanded
      if (searchRef.current && !searchRef.current.contains(event.target) && isSearchExpanded) {
         // Only collapse if the search input is empty
         if (!searchQuery) {
            setIsSearchExpanded(false);
         }
      }
    }
    // Bind the event listener
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef, searchRef, isSearchExpanded, searchQuery]); // Add dependencies

  // Focus search input when it expands
  useEffect(() => {
    if (isSearchExpanded && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchExpanded]);

  // Handle search focus
  const handleSearchFocus = () => {
    if (isSearchExpanded) {
      setShowRecommendations(true);
    }
  };

  // Handle search blur
  const handleSearchBlur = (e) => {
    // Don't hide if clicking inside recommendations or search container
    if (
      e.relatedTarget && 
      (e.relatedTarget.closest(`.${styles.searchRecommendations}`) ||
       e.relatedTarget.closest(`.${styles.searchContainer}`))
    ) {
      return;
    }
    setShowRecommendations(false);
  };

  // Handle recommendation click
  const handleRecommendationClick = (term) => {
    setSearchQuery(term);
    // Keep recommendations visible
    setShowRecommendations(true);
    // Focus the input
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  // Clear recent searches
  const clearRecentSearches = (e) => {
    e.preventDefault();
    e.stopPropagation();
    // In a real app, you would clear from localStorage/backend
    // For now, we'll just log
    console.log('Clearing recent searches');
  };

  return (
    <nav className={styles.navbar}> {/* Apply base navbar style */}
      <div className={`container ${styles.navbarContainer}`}> {/* Use container class and navbar specific container style */}

        {/* Logo */}
        <div className={styles.logo}>
          <Link to="/">sastashopping.com</Link>
        </div>

        {/* Desktop Navigation Links */}
        <div className={`${styles.desktopNav} ${isSearchExpanded ? styles.searchExpanded : ''}`}>
          <Link to="/" className={styles.navLink}>Home</Link>
          <Link to="/products" className={styles.navLink}>Products</Link>
          {/* Dropdown */}
          <div className={styles.dropdown} ref={dropdownRef}>
            <button className={styles.dropdownToggle} onClick={toggleDropdown}>
              Categories
              <ChevronDown className={`${styles.chevron} ${isDropdownOpen ? styles.chevronOpen : ''}`} />
            </button>
            {isDropdownOpen && (
              <div className={`${styles.dropdownMenu} ${isDropdownOpen ? styles.dropdownMenuOpen : ''}`}>
                {categories.map((category, index) => (
                  <Link 
                    key={index} 
                    to={`/category/${category.name.toLowerCase().replace(/\s+/g, '-')}`} 
                    className={styles.dropdownItem}
                  >
                    <span className={styles.categoryIcon}>{category.icon}</span>
                    {category.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
          <Link to="/about" className={styles.navLink}>About</Link>
          <Link to="/contact" className={styles.navLink}>Contact</Link>

          {/* Search Container (Desktop) */}
          <div
            className={`${styles.searchContainer} ${isSearchExpanded ? styles.searchExpanded : ''}`}
            ref={searchRef}
          >
            <input
              type="text"
              placeholder="Search products..."
              className={styles.searchInput}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              ref={searchInputRef}
              onFocus={handleSearchFocus}
              onBlur={handleSearchBlur}
            />
            <button 
              className={styles.searchButton} 
              onClick={toggleSearch}
              onMouseDown={(e) => e.preventDefault()} // Prevent blur event
            >
              <Search size={18} className={styles.searchIcon} />
              {!isSearchExpanded && <span className={styles.searchText}>Search</span>}
            </button>

            {/* Search Recommendations */}
            {isSearchExpanded && (
              <div 
                className={styles.searchRecommendations}
                onMouseDown={(e) => e.preventDefault()} // Prevent blur event
              >
                {/* Trending Searches */}
                <div className={styles.recommendationSection}>
                  <h3 className={styles.recommendationTitle}>
                    <TrendingUp size={16} />
                    Trending Searches
                  </h3>
                  <div className={styles.recommendationList}>
                    {trendingSearches.map((term, index) => (
                      <button
                        key={index}
                        className={styles.recommendationItem}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          handleRecommendationClick(term);
                        }}
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Recent Searches */}
                <div className={styles.recommendationSection}>
                  <div className={styles.recommendationHeader}>
                    <h3 className={styles.recommendationTitle}>
                      <Clock size={16} />
                      Recent Searches
                    </h3>
                    <button 
                      className={styles.clearRecent}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        clearRecentSearches(e);
                      }}
                    >
                      <Trash2 size={14} />
                      Clear
                    </button>
                  </div>
                  <div className={styles.recommendationList}>
                    {recentSearches.map((term, index) => (
                      <button
                        key={index}
                        className={styles.recommendationItem}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          handleRecommendationClick(term);
                        }}
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Popular Categories */}
                <div className={styles.recommendationSection}>
                  <h3 className={styles.recommendationTitle}>
                    <ShoppingBag size={16} />
                    Popular Categories
                  </h3>
                  <div className={styles.categoryGrid}>
                    {categories.slice(0, 4).map((category, index) => (
                      <button
                        key={index}
                        className={styles.categoryCard}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          handleRecommendationClick(category.name);
                        }}
                      >
                        <span className={styles.categoryIcon}>{category.icon}</span>
                        {category.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Menu Button */}
        <button className={styles.mobileMenuButton} onClick={toggleMobileMenu}>
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu (Conditional Class for animation/visibility) */}
      <div className={`${styles.mobileNav} ${isMobileMenuOpen ? styles.mobileNavOpen : ''}`}>
        <div className={styles.mobileNavContent}>
          <Link to="/" className={styles.mobileNavLink}>Home</Link>
          <Link to="/products" className={styles.mobileNavLink}>Products</Link>
          {categories.map((category, index) => (
            <Link 
              key={index}
              to={`/category/${category.name.toLowerCase().replace(/\s+/g, '-')}`} 
              className={styles.mobileNavLink}
            >
              <span className={styles.categoryIcon}>{category.icon}</span>
              {category.name}
            </Link>
          ))}
          <Link to="/about" className={styles.mobileNavLink}>About</Link>
          <Link to="/contact" className={styles.mobileNavLink}>Contact</Link>
          <div className={styles.mobileSearchContainer}>
            <input
              type="text"
              placeholder="Search products..."
              className={styles.mobileSearchInput}
            />
            {/* Mobile search button - kept for mobile layout */}
            <button className={`${styles.searchButton} ${styles.mobileSearchButton}`}>
              <Search size={18} className={styles.searchIcon} />
              Search
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
