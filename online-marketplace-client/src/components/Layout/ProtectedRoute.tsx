import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

/**
 * Свойства компонента ProtectedRoute.
 * @property {React.ReactNode} children - Компоненты, которые должны быть защищены.
 * @property {string} [requiredRole] - Необязательная роль, необходимая для доступа (например, "Buyer" или "Seller").
 */
interface Props {
    children: React.ReactNode;
    requiredRole?: string;
}

/**
 * Компонент-защита маршрута.
 * Ограничивает доступ к маршрутам только для авторизованных пользователей.
 * При указании `requiredRole` проверяет, совпадает ли роль пользователя.
 *
 * @component
 * @example
 * <ProtectedRoute requiredRole="Seller">
 *   <SellerDashboard />
 * </ProtectedRoute>
 */
const ProtectedRoute: React.FC<Props> = ({ children, requiredRole }) => {
    const { userId, role } = useAuth();

    if (!userId) {
        return <Navigate to="/login" />;
    }

    if (requiredRole && role !== requiredRole) {
        return <Navigate to="/" />;
    }

    return <>{children}</>;
};

export default ProtectedRoute;
