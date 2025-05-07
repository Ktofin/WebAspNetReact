import React, { useState } from "react";


/**
 * Компонент для смены пароля текущим пользователем.
 *
 * Вводятся текущий пароль, новый пароль и его повтор.
 * Выполняется POST-запрос на `/api/account/change-password`.
 * Выводится сообщение об успехе или ошибке.
 *
 * @component
 * @example
 * return <ChangePassword />;
 */
const ChangePassword: React.FC = () => {
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [repeatPassword, setRepeatPassword] = useState("");
    const [message, setMessage] = useState("");

    /**
     * Обработчик смены пароля.
     * Проверяет совпадение новых паролей и отправляет запрос на сервер.
     */
    const handleChangePassword = async () => {
        setMessage("");

        if (newPassword !== repeatPassword) {
            setMessage("Новые пароли не совпадают");
            return;
        }

        const res = await fetch("/api/account/change-password", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                currentPassword,
                newPassword
            })
        });

        if (res.ok) {
            setMessage("Пароль успешно изменён");
            setCurrentPassword("");
            setNewPassword("");
            setRepeatPassword("");
        } else {
            const error = await res.text();
            setMessage("Ошибка: " + error);
        }
    };

    return (
        <div>
            <h2>Смена пароля</h2>

            <label>Текущий пароль:</label>
            <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
            /><br />

            <label>Новый пароль:</label>
            <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
            /><br />

            <label>Повтор нового пароля:</label>
            <input
                type="password"
                value={repeatPassword}
                onChange={(e) => setRepeatPassword(e.target.value)}
            /><br />

            <button onClick={handleChangePassword}>Сменить пароль</button>

            {message && <p>{message}</p>}
        </div>
    );
};

export default ChangePassword;
