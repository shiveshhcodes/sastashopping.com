import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import styles from './FAQSection.module.css'; // Import CSS Module

function FAQSection() {
  const [activeFaq, setActiveFaq] = useState(null);

  const toggleFaq = (index) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  const faqs = [
    {
      question: "How does SastaShopping help me save money?",
      answer: "SastaShopping compares prices across multiple e-commerce platforms in real-time, helping you find the lowest price for any product. We also track price history and send alerts when prices drop, ensuring you never miss a good deal."
    },
    {
      question: "Which e-commerce platforms do you support?",
      answer: "We currently support major platforms including Amazon, Flipkart, Walmart, and more. We're constantly adding new platforms to provide you with comprehensive price comparisons."
    },
    {
      question: "How accurate are your price comparisons?",
      answer: "Our price data is updated in real-time directly from the retailers' websites. We verify prices multiple times a day to ensure accuracy and reliability."
    },
    {
      question: "Is there a cost to use SastaShopping?",
      answer: "No, SastaShopping is completely free to use. You can compare prices, track products, and receive price alerts without any charges."
    },
    {
      question: "How do price alerts work?",
      answer: "You can set your desired price for any product, and we'll notify you via email or push notification when the price drops to your specified amount. You can also track price history to make informed purchasing decisions."
    },
    {
      question: "Can I trust the price history data?",
      answer: "Yes, our price history data is collected from verified sources and updated regularly. We maintain historical records to help you identify price trends and make better purchasing decisions."
    }
  ];

  return (
    <section className={`${styles.faqSection} container container-lg my-5 py-5`}>
      <div className="row">
        <div className="col-12 text-center mb-5">
          <h3 className={`${styles.sectionSubtitle} fw-bold mb-4`}>Frequently Asked Questions</h3>
          <p className="lead text-muted mb-5">
            Find answers to common questions about our price comparison service
          </p>
        </div>
      </div>

      <div className="row justify-content-center">
        <div className="col-12 col-lg-8">
          {faqs.map((faq, index) => (
            <div key={index} className={styles.faqItem}>
              <div 
                className={`${styles.faqQuestion} ${activeFaq === index ? styles.active : ''}`}
                onClick={() => toggleFaq(index)}
              >
                <h4>{faq.question}</h4>
                {activeFaq === index ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
              </div>
              <div className={`${styles.faqAnswer} ${activeFaq === index ? styles.active : ''}`}>
                <p>{faq.answer}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default FAQSection;
