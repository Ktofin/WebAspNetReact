import React, { useEffect, useState } from "react";
import {
    Container,
    Paper,
    Typography,
    TextField,
    Button,
    Divider,
    Collapse,
    Alert,
    Box
} from "@mui/material";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
/**
 * Компонент профиля пользователя.
 * Позволяет:
 * - редактировать имя пользователя и email,
 * - менять пароль (с валидацией),
 * - удалять аккаунт.
 *
 * @component
 * @example
 * return <Profile />;
 */
const Profile: React.FC = () => {
    const { userId, logout } = useAuth();
    const navigate = useNavigate();
    const [originalData, setOriginalData] = useState<any>(null);
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(true);

    const [showPasswordChange, setShowPasswordChange] = useState(false);
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [repeatPassword, setRepeatPassword] = useState("");

    useEffect(() => {
        fetch('/api/account/me')
            .then(res => res.json())
            .then(user => {
                setOriginalData(user);
                setEmail(user.email || "");
                setUsername(user.userName || "");
            })
            .finally(() => setLoading(false));
    }, []);
    /**
     * Отправляет изменения email и имени пользователя.
     */
    const handleUpdate = async () => {
        const updated = {
            userName: username || originalData.userName,
            email: email || originalData.email
        };

        const res = await fetch(`/api/account/me`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updated)
        });

        if (res.ok) {
            setMessage("Профиль обновлён");
        } else {
            const error = await res.text();
            setMessage("Ошибка: " + error);
        }
    };
    /**
     * Удаляет профиль пользователя и перенаправляет на регистрацию.
     */
    const handleDelete = async () => {
        if (!window.confirm("Удалить профиль навсегда?")) return;

        const res = await fetch(`/api/user/${userId}`, {
            method: "DELETE"
        });

        if (res.ok) {
            logout();
            navigate("/register");
        } else {
            setMessage("Ошибка при удалении");
        }
    };
    /**
     * Отправляет новый пароль на сервер, если валидация пройдена.
     */
    const handlePasswordChange = async () => {
        if (newPassword !== repeatPassword) {
            setMessage("Новые пароли не совпадают");
            return;
        }

        const res = await fetch('/api/account/change-password', {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ currentPassword, newPassword })
        });

        if (res.ok) {
            setMessage("Пароль успешно изменён");
            setShowPasswordChange(false);
            setCurrentPassword("");
            setNewPassword("");
            setRepeatPassword("");
        } else {
            const data = await res.json();
            if (Array.isArray(data)) {
                const formattedErrors = data.map((e: any) => `• ${e.description}`).join("\n");
                setMessage(`Ошибка при смене пароля:\n${formattedErrors}`);
            } else {
                setMessage("Произошла ошибка");
            }
        }
    };
    // Валидация пароля
    const isLongEnough = newPassword.length >= 6;
    const hasUppercase = /[A-Z]/.test(newPassword);
    const hasLowercase = /[a-z]/.test(newPassword);
    const hasSpecial = /[^A-Za-z0-9]/.test(newPassword);
    const passwordsMatch = newPassword === repeatPassword;
    const passwordValid = isLongEnough && hasUppercase && hasLowercase && hasSpecial && passwordsMatch;

    if (loading || !originalData) return <Typography>Загрузка...</Typography>;

    return (
        <Container maxWidth="sm">
            <Paper elevation={3} sx={{ padding: 4, marginTop: 8 }}>
                <Typography variant="h5" gutterBottom>
                    Профиль
                </Typography>

                <TextField
                    label="Email"
                    variant="outlined"
                    fullWidth
                    margin="normal"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <TextField
                    label="Имя пользователя"
                    variant="outlined"
                    fullWidth
                    margin="normal"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />

                <Typography variant="body1" sx={{ mt: 2 }}>
                    <strong>Роль:</strong> {originalData.role}
                </Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>
                    <strong>Зарегистрирован:</strong> {new Date(originalData.registrationDate).toLocaleString()}
                </Typography>

                <Button variant="contained" color="primary" onClick={handleUpdate}>
                    Сохранить изменения
                </Button>
                <Button
                    variant="outlined"
                    color="error"
                    onClick={handleDelete}
                    sx={{ ml: 2 }}
                >
                    Удалить профиль
                </Button>

                <Divider sx={{ my: 3 }} />

                <Button
                    variant="text"
                    onClick={() => setShowPasswordChange(!showPasswordChange)}
                >
                    {showPasswordChange ? "Скрыть смену пароля" : "Сменить пароль"}
                </Button>

                <Collapse in={showPasswordChange}>
                    <Box sx={{ mt: 2 }}>
                        <TextField
                            label="Текущий пароль"
                            type="password"
                            fullWidth
                            margin="normal"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                        />
                        <TextField
                            label="Новый пароль"
                            type="password"
                            fullWidth
                            margin="normal"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                        />
                        <TextField
                            label="Повторите новый пароль"
                            type="password"
                            fullWidth
                            margin="normal"
                            value={repeatPassword}
                            onChange={(e) => setRepeatPassword(e.target.value)}
                        />

                        <ul style={{ fontSize: "0.9em", marginTop: "10px", paddingLeft: 20 }}>
                            <li style={{ color: isLongEnough ? "green" : "red" }}>Минимум 6 символов</li>
                            <li style={{ color: hasUppercase ? "green" : "red" }}>Хотя бы 1 заглавная (A-Z)</li>
                            <li style={{ color: hasLowercase ? "green" : "red" }}>Хотя бы 1 строчная (a-z)</li>
                            <li style={{ color: hasSpecial ? "green" : "red" }}>Хотя бы 1 спецсимвол (!@#$%^&*)</li>
                            <li style={{ color: passwordsMatch ? "green" : "red" }}>Пароли совпадают</li>
                        </ul>

                        <Button
                            variant="contained"
                            color="primary"
                            sx={{ mt: 2 }}
                            disabled={!passwordValid}
                            onClick={handlePasswordChange}
                        >
                            Подтвердить смену пароля
                        </Button>
                    </Box>
                </Collapse>

                {message && (
                    <Alert
                        severity={message.startsWith("Ошибка") ? "error" : "success"}
                        sx={{ mt: 3, whiteSpace: "pre-wrap" }}
                    >
                        {message}
                    </Alert>
                )}
            </Paper>
        </Container>
    );
};

export default Profile;
