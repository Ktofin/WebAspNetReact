/**
 * @file App.tsx
 * @description Главный компонент приложения, определяющий маршруты, глобальные провайдеры, и обработку ошибок.
 */
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Login from './components/Pages/Login';
import Register from './components/Pages/Register';
import Profile from './components/Pages/Profile';
import SellerDashboard from './components/Pages/SellerDashboard';
import ProtectedRoute from './components/Layout/ProtectedRoute';
import MainLayout from './components/Layout/MainLayout';
import Shop from './components/Pages/Shop';
import Cart from './components/Pages/Cart';
import MyOrders from "./components/Pages/MyOrders";
import { CustomThemeProvider } from "./contexts/ThemeContext";
import SellerHome from "./components/Pages/SellerHome";
import ProductDetail from './components/Pages/ProductDetail';
import SellerReviews from "./components/Pages/SellerReviews";

import SellerMassages from "./components/Pages/SellerMessages";
import ErrorBoundary from "./components/ErrorBoundary";

/**
 * Главный компонент приложения.
 * Подключает темы, обработку ошибок, аутентификацию и маршруты.
 *
 * @component
 * @returns {JSX.Element} Корневой JSX-элемент приложения.
 */

const App: React.FC = () => {
    return (
        <CustomThemeProvider>
            <ErrorBoundary>
        <AuthProvider>
            <Router>
                <MainLayout>
                    <Routes>
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/product/:id" element={<ProductDetail />} />
                        <Route
                            path="/seller/reviews"
                            element={
                                <ProtectedRoute requiredRole="Seller">
                                    <SellerReviews />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/seller/messages"
                            element={
                                <ProtectedRoute requiredRole="Seller">
                                    <SellerMassages />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/"
                            element={

                                <ProtectedRoute requiredRole="Buyer">
                                <Shop />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/cart"
                            element={
                                <ProtectedRoute requiredRole="Buyer">
                                    <Cart />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/my-orders"
                            element={
                                <ProtectedRoute requiredRole="Buyer">
                                    <MyOrders />
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="/profile"
                            element={
                                <ProtectedRoute>
                                    <Profile />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/seller"
                            element={
                                <ProtectedRoute requiredRole="Seller">
                                    <SellerDashboard />
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="/sellerHome"
                            element={
                                <ProtectedRoute requiredRole="Seller">
                                    <SellerHome />
                                </ProtectedRoute>
                            }
                        />
                    </Routes>
                </MainLayout>
            </Router>
        </AuthProvider>
            </ErrorBoundary>
        </CustomThemeProvider>
    );
};

export default App;
