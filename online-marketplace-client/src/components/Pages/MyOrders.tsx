import React, { useEffect, useState } from "react";
import {
    Typography,
    Box,
    Paper,
    Divider,
    CircularProgress,
    Alert,
    Chip
} from "@mui/material";
/**
 * Модель элемента заказа (позиции).
 */
interface OrderItem {
    id: number;
    productName: string;
    quantity: number;
    price: number;
    orderItemStatus: string;
    productImage?: string;
}
/**
 * Модель заказа.
 */
interface Order {
    id: number;
    orderDate: string;
    orderStatus: string;
    shippingAddress: string;
    totalAmount: number;
    items: OrderItem[];
}
/**
 * Цвета меток для статусов заказов.
 */
const statusColors: Record<string, "default" | "success" | "warning" | "info" | "error"> = {
    Waiting: "warning",
    Confirmed: "info",
    Shipped: "info",
    Completed: "success",
    Canceled: "error"
};

/**
 * Компонент отображения заказов текущего покупателя.
 * Загружает заказы с сервера и отображает их с данными по товарам и статусам.
 *
 * @component
 * @example
 * return <MyOrders />;
 */
const MyOrders: React.FC = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    /**
     * Загружает список заказов пользователя с API.
     */
    const loadOrders = async () => {
        try {
            const res = await fetch("/api/order/my");
            if (!res.ok) throw new Error("Не удалось загрузить заказы");
            const data = await res.json();
            setOrders(data);
        } catch (err) {
            setError("❌ Ошибка загрузки заказов");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadOrders();
    }, []);

    if (loading) return <CircularProgress />;
    if (error) return <Alert severity="error">{error}</Alert>;
    if (!orders.length) return <Typography>У вас пока нет заказов.</Typography>;

    return (
        <Box>
            <Typography variant="h5" gutterBottom>
                Мои заказы
            </Typography>

            {orders.map(order => (
                <Paper key={order.id} sx={{ p: 3, mb: 3 }}>
                    <Typography variant="subtitle1">
                        Заказ №{order.id} • {new Date(order.orderDate).toLocaleDateString()}
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                        Адрес: {order.shippingAddress || "не указан"} | Статус:{" "}
                        <Chip
                            label={order.orderStatus}
                            color={statusColors[order.orderStatus] || "default"}
                            size="small"
                        />
                    </Typography>
                    <Divider sx={{ my: 1 }} />

                    {order.items.map(item => (
                        <Box key={item.id} sx={{ mb: 1 }}>
                            <Typography>
                                <strong>{item.productName}</strong> × {item.quantity} — {item.price} ₽
                                <Chip
                                    label={item.orderItemStatus}
                                    size="small"
                                    sx={{ ml: 1 }}
                                    color={statusColors[item.orderItemStatus] || "default"}
                                />
                            </Typography>
                        </Box>
                    ))}

                    <Divider sx={{ my: 1 }} />
                    <Typography variant="subtitle2">
                        Общая сумма: <strong>{order.totalAmount} ₽</strong>
                    </Typography>
                </Paper>
            ))}
        </Box>
    );
};

export default MyOrders;
