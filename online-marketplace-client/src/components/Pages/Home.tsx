import React from "react";
import { useAuth } from "../../contexts/AuthContext";


/**
 * Главная страница после входа пользователя.
 * Показывает приветствие и роль текущего авторизованного пользователя.
 *
 * @component
 * @example
 * return <Home />;
 */
const Home: React.FC = () => {
    const { role, username } = useAuth();

    return (
        <div>
            <h2>Добро пожаловать, {username}!</h2>
            <p>Вы вошли как <strong>{role}</strong></p>
        </div>
    );
};

export default Home;
