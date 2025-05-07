import React, { useState } from 'react';
import {
    Container,
    Paper,
    Typography,
    TextField,
    Button,
    Select,
    MenuItem,
    InputLabel,
    FormControl,
    Alert
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
/**
 * Компонент регистрации нового пользователя.
 * Позволяет выбрать роль (продавец/покупатель), ввести email и пароль с валидацией.
 *
 * @component
 * @example
 * return <Register />;
 */
const Register: React.FC = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [repeatPassword, setRepeatPassword] = useState('');
    const [role, setRole] = useState('Buyer');
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    // Валидация пароля
    const isLongEnough = password.length >= 6;
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasSpecial = /[^A-Za-z0-9]/.test(password);
    const passwordsMatch = password === repeatPassword;

    const isValid = isLongEnough && hasUppercase && hasLowercase && hasSpecial && passwordsMatch;
    /**
     * Отправляет данные на сервер для регистрации пользователя.
     */
    const handleRegister = async () => {
        setError(null);

        if (!isValid) {
            setError("Пароль не соответствует требованиям");
            return;
        }

        try {
            const res = await fetch('/api/account/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: username.trim(), email: email.trim(), password, role }),
            });

            if (!res.ok) throw new Error("Ошибка регистрации");

            navigate('/login');
        } catch (err: any) {
            setError(err.message || "Ошибка при регистрации");
        }
    };

    return (
        <Container maxWidth="sm">
            <Paper elevation={3} sx={{ padding: 4, marginTop: 8 }}>
                <Typography variant="h5" gutterBottom align="center">
                    Регистрация
                </Typography>

                <TextField
                    label="Логин"
                    variant="outlined"
                    fullWidth
                    margin="normal"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />
                <TextField
                    label="Email"
                    variant="outlined"
                    fullWidth
                    margin="normal"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <FormControl fullWidth margin="normal">
                    <InputLabel>Роль</InputLabel>
                    <Select
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        label="Роль"
                    >
                        <MenuItem value="Buyer">Покупатель</MenuItem>
                        <MenuItem value="Seller">Продавец</MenuItem>
                    </Select>
                </FormControl>
                <TextField
                    label="Пароль"
                    type="password"
                    variant="outlined"
                    fullWidth
                    margin="normal"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <TextField
                    label="Повторите пароль"
                    type="password"
                    variant="outlined"
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
                    onClick={handleRegister}
                    disabled={!isValid}
                >
                    Зарегистрироваться
                </Button>
            </Paper>
        </Container>
    );
};

export default Register;
