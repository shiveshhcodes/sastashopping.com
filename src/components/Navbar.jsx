import React, { useState, useRef, useEffect } from 'react';
import { Menu, X, ChevronDown } from 'lucide-react'; // Import icons
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
          Logo {/* Replace with your actual logo (text or <img>) */}
        </div>

        {/* Desktop Navigation Links */}
        <div className={styles.desktopNav}>
          <a href="#" className={styles.navLink}>Home Deals</a>
          <a href="#" className={styles.navLink}>Best Prices</a>
          {/* Dropdown */}
          <div className={styles.dropdown} ref={dropdownRef}>
            <button onClick={toggleDropdown} className={`${styles.navLink} ${styles.dropdownToggle}`}>
              More Options <ChevronDown size={16} className={`${styles.chevron} ${isDropdownOpen ? styles.chevronOpen : ''}`} />
            </button>
            {/* Use CSS for visibility based on state/class */}
            <div className={`${styles.dropdownMenu} ${isDropdownOpen ? styles.dropdownMenuOpen : ''}`}>
              <a href="#" className={styles.dropdownItem}>Option 1</a>
              <a href="#" className={styles.dropdownItem}>Option 2</a>
              <a href="#" className={styles.dropdownItem}>Option 3</a>
            </div>
          </div>
          <a href="#" className={styles.navLink}>Link Three</a>
        </div>

        {/* Search Button (Desktop) */}
        <div className={styles.desktopSearch}>
          <button className={styles.searchButton}>
            Search
          </button>
        </div>

        {/* Mobile Menu Button */}
        <div className={styles.mobileMenuButton}>
          <button onClick={toggleMobileMenu} aria-label="Toggle menu">
            {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu (Conditional Class for animation/visibility) */}
      <div className={`${styles.mobileNav} ${isMobileMenuOpen ? styles.mobileNavOpen : ''}`}>
         <a href="#" className={styles.mobileNavLink} onClick={() => setIsMobileMenuOpen(false)}>Home Deals</a>
         <a href="#" className={styles.mobileNavLink} onClick={() => setIsMobileMenuOpen(false)}>Best Prices</a>
         {/* Simple link for mobile dropdown */}
         <a href="#" className={styles.mobileNavLink} onClick={() => setIsMobileMenuOpen(false)}>More Options</a>
         <a href="#" className={styles.mobileNavLink} onClick={() => setIsMobileMenuOpen(false)}>Link Three</a>
         <button className={`${styles.searchButton} ${styles.mobileSearchButton}`}>
           Search
         </button>
      </div>
    </nav>
  );
}

export default Navbar;
