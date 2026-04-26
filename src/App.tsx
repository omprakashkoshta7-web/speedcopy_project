import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { LoadingProvider } from './context/LoadingContext';
import TopLoadingBar from './components/TopLoadingBar';
import useAxiosLoader from './hooks/useAxiosLoader';

// Scroll to top on every route change
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);
  return null;
}

// Connects axios to the global loading bar — must be inside LoadingProvider
function AxiosLoaderSetup() {
  useAxiosLoader();
  return null;
}

const HomePage = lazy(() => import('./pages/HomePage'));
const ReferPage = lazy(() => import('./pages/ReferPage'));
const WalletPage = lazy(() => import('./pages/WalletPage'));
const AddressPage = lazy(() => import('./pages/AddressPage'));
const OrdersPage = lazy(() => import('./pages/OrdersPage'));
const NotificationsPage = lazy(() => import('./pages/NotificationsPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const HelpPage = lazy(() => import('./pages/HelpPage'));
const RaiseTicketPage = lazy(() => import('./pages/RaiseTicketPage'));
const PrintingPage = lazy(() => import('./pages/PrintingPage'));
const BusinessPrintingPage = lazy(() => import('./pages/BusinessPrintingPage'));
const GiftingPage = lazy(() => import('./pages/GiftingPage'));
const ShoppingPage = lazy(() => import('./pages/ShoppingPage'));
const ServicePackagePage = lazy(() => import('./pages/ServicePackagePage'));
const PickupLocationPage = lazy(() => import('./pages/PickupLocationPage'));
const FindCenterPage = lazy(() => import('./pages/FindCenterPage'));
const PrintConfigPage = lazy(() => import('./pages/PrintConfigPage'));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));
const PrintCheckoutPage = lazy(() => import('./pages/PrintCheckoutPage'));
const OrderDetailPage = lazy(() => import('./pages/OrderDetailPage'));
const PaymentSuccessPage = lazy(() => import('./pages/PaymentSuccessPage'));
const ProductDetailPage = lazy(() => import('./pages/ProductDetailPage'));
const GiftingProductDetailPage = lazy(() => import('./pages/GiftingProductDetailPage'));
const CartPage = lazy(() => import('./pages/CartPage'));
const WishlistPage = lazy(() => import('./pages/WishlistPage'));
const ContactSalesPage = lazy(() => import('./pages/ContactSalesPage'));
const ProductListPage = lazy(() => import('./pages/ProductListPage'));
const DesignEditorPage = lazy(() => import('./pages/DesignEditorPage'));
const GiftingCheckoutPage = lazy(() => import('./pages/GiftingCheckoutPage'));
const AddFundsPage = lazy(() => import('./pages/AddFundsPage'));
const OrderTrackingFAQPage = lazy(() => import('./pages/OrderTrackingFAQPage'));
const PaymentsFAQPage = lazy(() => import('./pages/PaymentsFAQPage'));
const TechnicalSupportFAQPage = lazy(() => import('./pages/TechnicalSupportFAQPage'));
const BusinessCardsListPage = lazy(() => import('./pages/BusinessCardsListPage'));
const FlyersListPage = lazy(() => import('./pages/FlyersListPage'));
const BrochuresListPage = lazy(() => import('./pages/BrochuresListPage'));
const PostersListPage = lazy(() => import('./pages/PostersListPage'));
const LetterheadsListPage = lazy(() => import('./pages/LetterheadsListPage'));
const CustomStationeryListPage = lazy(() => import('./pages/CustomStationeryListPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));

const RouteFallback: React.FC = () => (
  <div
    className="min-h-screen flex items-center justify-center text-sm font-semibold"
    style={{ backgroundColor: '#f0f0f0', color: '#6b7280' }}
  >
    {/* intentionally blank — TopLoadingBar handles the visual feedback */}
  </div>
);


const App: React.FC = () => {
  return (
    <LoadingProvider>
      <AuthProvider>
        <CartProvider>
          <BrowserRouter>
            <AxiosLoaderSetup />
            <TopLoadingBar />
            <ScrollToTop />
            <Suspense fallback={<RouteFallback />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/refer" element={<ReferPage />} />
            <Route path="/wallet" element={<WalletPage />} />
            <Route path="/addresses" element={<AddressPage />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/help" element={<HelpPage />} />
            <Route path="/support/ticket" element={<RaiseTicketPage />} />
            <Route path="/printing" element={<PrintingPage />} />
            <Route path="/business-printing" element={<BusinessPrintingPage />} />
            <Route path="/gifting" element={<GiftingPage />} />
            <Route path="/shopping" element={<ShoppingPage />} />
            <Route path="/service-package" element={<ServicePackagePage />} />
            <Route path="/pickup-location" element={<PickupLocationPage />} />
            <Route path="/find-center" element={<FindCenterPage />} />
          <Route path="/print-config" element={<PrintConfigPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/print-checkout" element={<PrintCheckoutPage />} />
          <Route path="/order-detail/:id" element={<OrderDetailPage />} />
          <Route path="/payment-success" element={<PaymentSuccessPage />} />
          <Route path="/product/:id" element={<ProductDetailPage />} />
          <Route path="/gifting-product/:id" element={<GiftingProductDetailPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/wishlist" element={<WishlistPage />} />
          <Route path="/contact-sales" element={<ContactSalesPage />} />
          <Route path="/product-list" element={<ProductListPage />} />
          <Route path="/products" element={<ProductListPage />} />
          <Route path="/design-editor" element={<DesignEditorPage />} />
          <Route path="/gifting-checkout" element={<GiftingCheckoutPage />} />
          <Route path="/add-funds" element={<AddFundsPage />} />
          <Route path="/faq/order-tracking" element={<OrderTrackingFAQPage />} />
          <Route path="/faq/payments" element={<PaymentsFAQPage />} />
          <Route path="/faq/technical-support" element={<TechnicalSupportFAQPage />} />
          <Route path="/business-cards" element={<BusinessCardsListPage />} />
          <Route path="/flyers" element={<FlyersListPage />} />
          <Route path="/brochures" element={<BrochuresListPage />} />
          <Route path="/posters" element={<PostersListPage />} />
          <Route path="/letterheads" element={<LetterheadsListPage />} />
          <Route path="/custom-stationery" element={<CustomStationeryListPage />} />
          <Route path="/contact" element={<ContactPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
      </CartProvider>
    </AuthProvider>
    </LoadingProvider>
  );
};

export default App;
