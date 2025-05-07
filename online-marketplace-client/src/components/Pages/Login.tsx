import React, { useState } from 'react';
import {
    Box,
    Button,
    Container,
    Paper,
    TextField,
    Typography,
    Alert
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

/**
 * Компонент формы авторизации пользователя.
 *
 * Отправляет логин и пароль на сервер, получает профиль,
 * сохраняет данные в контексте и перенаправляет в зависимости от роли.
 *
 * @component
 * @example
 * return <Login />;
 */
const Login: React.FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const { login } = useAuth();
    const navigate = useNavigate();

    /**
     * Обрабатывает процесс входа:
     * - отправка запроса на /api/account/login
     * - получение текущего пользователя
     * - сохранение данных и редирект по роли
     */
    const handleLogin = async () => {
        setError(null);
        try {
            const response = await fetch('/api/account/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            if (!response.ok) throw new Error('Неверный логин или пароль');

            const profileRes = await fetch('/api/account/me');
            const profile = await profileRes.json();

            login(profile.id, profile.role, profile.userName);
            if (profile.role === "Seller") {
                navigate("/sellerHome");
            } else {
                navigate("/");
            }
        } catch (err: any) {
            setError(err.message || "Ошибка при входе");
        }
    };

    return (
        <Container maxWidth="sm">
            <Paper elevation={3} sx={{ padding: 4, marginTop: 8 }}>
                <Typography variant="h5" gutterBottom align="center">
                    Вход в систему
                </Typography>

                <Box component="form" noValidate autoComplete="off">
                    <TextField
                        label="Логин"
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                    <TextField
                        label="Пароль"
                        type="password"
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />

                    {error && (
                        <Alert severity="error" sx={{ mt: 2 }}>
                            {error}
                        </Alert>
                    )}

                    <Button
                        variant="contained"
                        color="primary"
                        fullWidth
                        sx={{ mt: 3 }}
                        onClick={handleLogin}
                    >
                        Войти
                    </Button>
                </Box>
            </Paper>
        </Container>
    );
};

export default Login;
