import React, { createContext, useContext, useState } from "react";
import {
    getUserFromStorage,
    setUserToStorage,
    clearUserFromStorage
} from "../services/authService";
/**
 * Тип, определяющий структуру контекста аутентификации.
 * @property {string | null} userId - Идентификатор пользователя.
 * @property {string | null} role - Роль пользователя (например, "Seller" или "Buyer").
 * @property {string | null} username - Имя пользователя.
 * @property {(id: string, role: string, username: string) => void} login - Функция входа.
 * @property {() => void} logout - Функция выхода.
 */
interface AuthContextType {
    userId: string | null;
    role: string | null;
    username: string | null;
    login: (id: string, role: string, username: string) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Провайдер контекста аутентификации.
 * Используется для управления состоянием пользователя (вход/выход).
 *
 * @component
 * @param {Object} props
 * @param {React.ReactNode} props.children - Дочерние компоненты, имеющие доступ к контексту.
 * @returns {JSX.Element} Компонент-провайдер.
 */

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const stored = getUserFromStorage();
    const [userId, setUserId] = useState(stored.userId);
    const [role, setRole] = useState(stored.role);
    const [username, setUsername] = useState(stored.username);
    /**
     * Устанавливает данные пользователя в состояние и в localStorage.
     * @param {string} id - Идентификатор пользователя.
     * @param {string} role - Роль пользователя.
     * @param {string} username - Имя пользователя.
     */
    const login = (id: string, role: string, username: string) => {
        setUserId(id);
        setRole(role);
        setUsername(username);
        setUserToStorage(id, role, username);
    };
    /**
     * Очищает состояние пользователя и localStorage.
     */
    const logout = () => {
        setUserId(null);
        setRole(null);
        setUsername(null);
        clearUserFromStorage();
    };

    return (
        <AuthContext.Provider value={{ userId, role, username, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
/**
 * Хук для доступа к контексту аутентификации.
 * Обязательно должен использоваться внутри AuthProvider.
 * @throws {Error} Если хук используется вне AuthProvider.
 * @returns {AuthContextType} Контекст аутентификации.
 */

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used within AuthProvider");
    return context;
};
