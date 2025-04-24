import React, { useState, useRef, useEffect } from 'react';
import { Menu, X, ChevronDown, Search } from 'lucide-react'; // Import icons and Search icon
import styles from './Navbar.module.css'; // Import CSS Module

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


  return (
    <nav className={styles.navbar}> {/* Apply base navbar style */}
      <div className={`container ${styles.navbarContainer}`}> {/* Use container class and navbar specific container style */}

        {/* Logo */}
        <div className={styles.logo}>
          sastashopping.com
        </div>

        {/* Desktop Navigation Links */}
        <div className={styles.desktopNav}>
          <a href="/" className={styles.navLink}>Home</a>
          <a href="/products" className={styles.navLink}>Products</a>
          {/* Dropdown */}
          <div className={styles.dropdown} ref={dropdownRef}>
            <button className={styles.dropdownToggle} onClick={toggleDropdown}>
              Categories
              <ChevronDown className={`${styles.chevron} ${isDropdownOpen ? styles.chevronOpen : ''}`} />
            </button>
            {isDropdownOpen && (
              <div className={`${styles.dropdownMenu} ${isDropdownMenuOpen ? styles.dropdownMenuOpen : ''}`}>
                <a href="/electronics" className={styles.dropdownItem}>Electronics</a>
                <a href="/clothing" className={styles.dropdownItem}>Clothing</a>
                <a href="/home" className={styles.dropdownItem}>Home & Kitchen</a>
              </div>
            )}
          </div>
          <a href="/about" className={styles.navLink}>About</a>
          <a href="/contact" className={styles.navLink}>Contact</a>

          {/* Search Container (Desktop) - Moved inside desktopNav */}
          <div
            className={`${styles.searchContainer} ${isSearchExpanded ? styles.searchExpanded : ''}`}
            ref={searchRef}
            // Removed hover events, expansion is now click-based
          >
            <input
              type="text"
              placeholder="Search products..."
              className={styles.searchInput}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              ref={searchInputRef} // Attach ref to input
              // Prevent click on input from collapsing the search container
              onClick={(e) => e.stopPropagation()}
            />
            {/* Button to toggle search expansion */}
            <button className={styles.searchButton} onClick={toggleSearch}>
              <Search size={18} className={styles.searchIcon} />
              {/* Text is only visible when not expanded */}
              {!isSearchExpanded && <span className={styles.searchText}>Search</span>}
            </button>
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
          <a href="/" className={styles.mobileNavLink}>Home</a>
          <a href="/products" className={styles.mobileNavLink}>Products</a>
          <a href="/electronics" className={styles.mobileNavLink}>Electronics</a>
          <a href="/clothing" className={styles.mobileNavLink}>Clothing</a>
          <a href="/home" className={styles.mobileNavLink}>Home & Kitchen</a>
          <a href="/about" className={styles.mobileNavLink}>About</a>
          <a href="/contact" className={styles.mobileNavLink}>Contact</a>
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
