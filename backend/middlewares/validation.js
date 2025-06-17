const { validationResult } = require('express-validator');
const { ValidationError } = require('./errorHandler');

// Validation middleware
const validate = (validations) => {
  return async (req, res, next) => {
    // Run all validations
    await Promise.all(validations.map(validation => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    // Format validation errors
    const formattedErrors = errors.array().map(error => ({
      field: error.param,
      message: error.msg,
      value: error.value
    }));

    throw new ValidationError({
      message: 'Validation failed',
      errors: formattedErrors
    });
  };
};

// Common validation rules
const commonValidations = {
  // User validations
  user: {
    email: {
      isEmail: true,
      normalizeEmail: true,
      errorMessage: 'Please provide a valid email address'
    },
    password: {
      isLength: {
        options: { min: 8 },
        errorMessage: 'Password must be at least 8 characters long'
      },
      matches: {
        options: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
        errorMessage: 'Password must contain at least one uppercase letter, one lowercase letter, one number and one special character'
      }
    },
    name: {
      isLength: {
        options: { min: 2, max: 50 },
        errorMessage: 'Name must be between 2 and 50 characters long'
      },
      matches: {
        options: /^[a-zA-Z\s]*$/,
        errorMessage: 'Name can only contain letters and spaces'
      }
    }
  },

  // Product validations
  product: {
    name: {
      isLength: {
        options: { min: 3, max: 100 },
        errorMessage: 'Product name must be between 3 and 100 characters long'
      }
    },
    price: {
      isFloat: {
        options: { min: 0 },
        errorMessage: 'Price must be a positive number'
      }
    },
    description: {
      isLength: {
        options: { min: 10, max: 1000 },
        errorMessage: 'Description must be between 10 and 1000 characters long'
      }
    }
  },

  // Search validations
  search: {
    query: {
      isLength: {
        options: { min: 2 },
        errorMessage: 'Search query must be at least 2 characters long'
      }
    },
    page: {
      isInt: {
        options: { min: 1 },
        errorMessage: 'Page number must be a positive integer'
      }
    },
    limit: {
      isInt: {
        options: { min: 1, max: 100 },
        errorMessage: 'Limit must be between 1 and 100'
      }
    }
  },

  // Comparison validations
  comparison: {
    productId: {
      isMongoId: {
        errorMessage: 'Invalid product ID format'
      }
    },
    platforms: {
      isArray: {
        errorMessage: 'Platforms must be an array'
      },
      custom: {
        options: (value) => {
          const validPlatforms = ['amazon', 'flipkart', 'myntra'];
          return value.every(platform => validPlatforms.includes(platform));
        },
        errorMessage: 'Invalid platform specified'
      }
    }
  }
};

module.exports = {
  validate,
  commonValidations
}; 