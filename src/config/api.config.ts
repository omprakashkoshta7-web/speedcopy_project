// API Configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || '',
  TIMEOUT: 30000,
  ENDPOINTS: {
    // Auth
    AUTH: {
      REGISTER: '/api/auth/register',
      LOGIN: '/api/auth/login',
      VERIFY_TOKEN: '/api/auth/verify',
      SEND_PHONE_OTP: '/api/auth/phone/send-otp',
      VERIFY_PHONE_OTP: '/api/auth/phone/verify-otp',
      ME: '/api/auth/me',
    },
    // User
    USER: {
      PROFILE: '/api/users/profile',
      ADDRESSES: '/api/users/addresses',
    },
    // Products
    PRODUCTS: {
      BUSINESS_PRINTING: {
        HOME: '/api/business-printing/home',
        TYPES: '/api/business-printing/types',
        CATEGORIES: '/api/business-printing/categories',
        PRODUCTS: '/api/business-printing/products',
        PRODUCT_BY_ID: (id: string) => `/api/business-printing/products/${id}`,
        PICKUP_LOCATIONS: '/api/business-printing/pickup-locations',
        CONFIGURE: '/api/business-printing/configure',
        CONFIG_BY_ID: (id: string) => `/api/business-printing/config/${id}`,
      },
      PRINTING: {
        HOME: '/api/products/printing/home',
        CATEGORIES: '/api/products/printing/categories',
        PRODUCTS: '/api/products/printing/products',
      },
      GIFTING: {
        HOME: '/api/gifting/home',
        CATEGORIES: '/api/gifting/categories',
        PRODUCTS: '/api/gifting/products',
        PRODUCT_BY_ID: (id: string) => `/api/gifting/products/${id}`,
      },
      SHOPPING: {
        HOME: '/api/shopping/home',
        CATEGORIES: '/api/shopping/categories',
        PRODUCTS: '/api/shopping/products',
        PRODUCT_BY_ID: (id: string) => `/api/shopping/products/${id}`,
      },
    },
    // Orders
    ORDERS: {
      CREATE: '/api/orders',
      MY_ORDERS: '/api/orders/my-orders',
      ORDER_BY_ID: (id: string) => `/api/orders/${id}`,
      TRACK: (id: string) => `/api/orders/${id}/track`,
    },
    // Payment
    PAYMENT: {
      CREATE: '/api/wallet/razorpay/initiate',
      VERIFY: '/api/wallet/razorpay/verify',
    },
    // Finance
    FINANCE: {
      WALLET: '/api/wallet',
      WALLET_OVERVIEW: '/api/wallet/overview',
      LEDGER: '/api/wallet/ledger',
      TOPUP_CONFIG: '/api/wallet/topup-config',
      TOPUP_PREVIEW: '/api/wallet/topup-preview',
      ADD_FUNDS: '/api/wallet/add-funds',
      REFERRALS: '/api/referrals',
      REFERRAL_SUMMARY: '/api/referrals/summary',
      APPLY_REFERRAL: '/api/referrals/apply',
    },
    // Notifications
    NOTIFICATIONS: {
      GET_ALL: '/api/notifications',
      MARK_READ: (id: string) => `/api/notifications/${id}/read`,
      MARK_ALL_READ: '/api/notifications/mark-all-read',
    },
    // Vendors
    VENDORS: {
      NEARBY_STORES: '/api/vendor/stores/nearby',
    },
    // Wishlist
    WISHLIST: {
      GET: '/api/users/wishlist',
      ADD: '/api/users/wishlist',
      REMOVE: (productId: string) => `/api/users/wishlist/${productId}`,
      CLEAR: '/api/users/wishlist',
    },
    // Delivery
    DELIVERY: {
      TRACK: (orderId: string) => `/api/delivery/track/${orderId}`,
    },
  },
};

export default API_CONFIG;
