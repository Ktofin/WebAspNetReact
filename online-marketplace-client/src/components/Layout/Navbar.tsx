import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    Drawer,
    AppBar,
    Toolbar,
    Typography,
    IconButton,
    List,
    ListItem,
    ListItemText,
    ListItemButton,
    Box,
    Divider,
    Button,
    useTheme
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import { useAuth } from "../../contexts/AuthContext";
import { useThemeMode } from "../../contexts/ThemeContext";
/**
 * Навигационная панель приложения.
 *
 * Отображает:
 * - Название приложения
 * - Бургер-меню с навигацией по ролям (продавец / покупатель)
 * - Переключение темы (светлая/тёмная)
 * - Кнопку "Выйти" при авторизации
 *
 * Меню строится на основе текущего пользователя и его роли.
 *
 * @component
 * @example
 * return <Navbar />;
 */
const Navbar: React.FC = () => {
    const [open, setOpen] = useState(false);
    const { userId, username, role, logout } = useAuth();
    const { toggleMode } = useThemeMode();
    const theme = useTheme();
    const navigate = useNavigate();

    const toggleDrawer = () => setOpen(!open);
    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const menuItems: { label: string; to: string; show?: boolean }[] = [
        {
            label: "Главная",
            to: userId && role === "Seller" ? "/sellerHome" : "/",
            show: true
        },
        { label: "Войти", to: "/login", show: !userId },
        { label: "Регистрация", to: "/register", show: !userId },
        { label: "Панель продавца", to: "/seller", show: Boolean(userId && role === "Seller") },
        { label: "Мои заказы", to: "/my-orders", show: Boolean(userId && role === "Buyer") },
        { label: "Профиль", to: "/profile", show: Boolean(userId) },
        { label: "Корзина", to: "/cart", show: Boolean(userId && role === "Buyer") },
        { label: "Отзывы", to: "/seller/reviews", show: Boolean(userId && role === "Seller") },
        { label: "Сообщения", to: "/seller/messages", show: Boolean(userId && role === "Seller") }
    ];

    return (
        <>
            <AppBar position="sticky" sx={{ backgroundColor: theme.palette.primary.main }}>
                <Toolbar>
                    <IconButton edge="start" color="inherit" onClick={toggleDrawer}>
                        <MenuIcon />
                    </IconButton>

                    <Typography variant="h6" sx={{ flexGrow: 1 }}>
                        OnlineMarket
                    </Typography>

                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <IconButton color="inherit" onClick={toggleMode}>
                            {theme.palette.mode === "dark" ? <LightModeIcon /> : <DarkModeIcon />}
                        </IconButton>


                    </Box>
                </Toolbar>
            </AppBar>

            <Drawer anchor="left" open={open} onClose={toggleDrawer}>
                <Box sx={{ width: 250 }} role="presentation" onClick={toggleDrawer}>
                    <List>
                        {menuItems
                            .filter(item => item.show)
                            .map((item, index) => (
                                <ListItem key={index} disablePadding>
                                    <ListItemButton component={Link} to={item.to}>
                                        <ListItemText primary={item.label} />
                                    </ListItemButton>
                                </ListItem>
                            ))}
                    </List>
                    {userId && (
                        <>
                            <Divider />
                            <List>
                                <ListItem disablePadding>
                                    <ListItemButton onClick={handleLogout}>
                                        <ListItemText primary="Выйти" />
                                    </ListItemButton>
                                </ListItem>
                            </List>
                        </>
                    )}
                </Box>
            </Drawer>
        </>
    );
};

export default Navbar;
