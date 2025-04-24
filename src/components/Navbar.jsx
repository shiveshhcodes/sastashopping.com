import React, { useState, useRef, useEffect } from 'react';
import { Menu, X, ChevronDown, Search } from 'lucide-react'; // Import icons and Search icon
import styles from './Navbar.module.css'; // Import CSS Module

// Navbar component
function Navbar() {
  // State for mobile menu visibility
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  // State for dropdown visibility
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  // Ref for the dropdown to detect outside clicks
  const dropdownRef = useRef(null);

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    setIsDropdownOpen(false); // Close dropdown when opening/closing mobile menu
  };

  // Toggle dropdown menu
  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  // Close dropdown if clicked outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    // Bind the event listener
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);


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
              <div className={`${styles.dropdownMenu} ${isDropdownOpen ? styles.dropdownMenuOpen : ''}`}>
                <a href="/electronics" className={styles.dropdownItem}>Electronics</a>
                <a href="/clothing" className={styles.dropdownItem}>Clothing</a>
                <a href="/home" className={styles.dropdownItem}>Home & Kitchen</a>
              </div>
            )}
          </div>
          <a href="/about" className={styles.navLink}>About</a>
          <a href="/contact" className={styles.navLink}>Contact</a>
        </div>

        {/* Search Button (Desktop) */}
        <div className={styles.desktopSearch}>
          <button className={styles.searchButton}>
            <Search size={18} className={styles.searchIcon} />
            Search
          </button>
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
          <button className={`${styles.searchButton} ${styles.mobileSearchButton}`}>
            <Search size={18} className={styles.searchIcon} />
            Search
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;