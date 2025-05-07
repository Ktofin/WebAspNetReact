import React, { useEffect, useState } from "react";
import {
    Typography,
    Paper,
    Box,
    Divider,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    CircularProgress,
    Alert,
    Chip
} from "@mui/material";
import { useAuth } from "../../contexts/AuthContext";
/**
 * Элемент заказа.
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
 * Заказ, содержащий список элементов.
 */
interface Order {
    id: number;
    orderDate: string;
    buyerUsername: string;
    buyerEmail: string;
    shippingAddress: string;
    items: OrderItem[];
}
/**
 * Массив допустимых статусов заказа.
 */

const statusOptions = ["Waiting", "Confirmed", "Shipped", "Completed", "Canceled"];
/**
 * Цветовые метки для отображения статуса.
 */
const statusColors: Record<string, "default" | "success" | "warning" | "info" | "error"> = {
    Waiting: "warning",
    Confirmed: "info",
    Shipped: "info",
    Completed: "success",
    Canceled: "error"
};
/**
 * Компонент отображает все заказы на товары текущего продавца с возможностью фильтрации и смены статуса.
 *
 * @component
 * @example
 * return <SellerOrders />;
 */

const SellerOrders: React.FC = () => {
    const { userId } = useAuth();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState<string | null>(null);
    const [filter, setFilter] = useState<string>("Все");
    /**
     * Загружает заказы продавца с сервера.
     */
    const loadOrders = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/order/seller");
            const data = await res.json();
            setOrders(data);
        } catch (err) {
            setMessage("❌ Ошибка при загрузке заказов");
        } finally {
            setLoading(false);
        }
    };
    /**
     * Обновляет статус конкретного элемента заказа.
     * @param itemId ID позиции заказа
     * @param newStatus Новый статус
     */

    const handleStatusChange = async (itemId: number, newStatus: string) => {
        const res = await fetch(`/api/orderitem/${itemId}/status`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newStatus)
        });

        if (res.ok) {
            setMessage("✅ Статус обновлён");
            await loadOrders();
        } else {
            const err = await res.text();
            setMessage("❌ Ошибка: " + err);
        }
    };

    useEffect(() => {
        loadOrders();
    }, []);
    /**
     * Фильтрует заказы по выбранному статусу.
     */
    const filteredOrders = orders.filter(order =>
        filter === "Все" || order.items.some(i => i.orderItemStatus === filter)
    );

    if (loading) return <CircularProgress />;
    if (!orders.length) return <Typography>Нет заказов на ваши товары.</Typography>;

    return (
        <Box>
            <Typography variant="h5" gutterBottom>
                Заказы на мои товары
            </Typography>

            {message && (
                <Alert sx={{ mb: 2 }} severity={message.startsWith("✅") ? "success" : "error"}>
                    {message}
                </Alert>
            )}

            <FormControl sx={{ mb: 3, minWidth: 200 }} size="small">
                <InputLabel>Фильтр по статусу</InputLabel>
                <Select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    label="Фильтр по статусу"
                >
                    <MenuItem value="Все">Все</MenuItem>
                    {statusOptions.map((status) => (
                        <MenuItem key={status} value={status}>
                            {status}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>

            {filteredOrders.map((order) => (
                <Paper key={order.id} sx={{ p: 3, mb: 3 }}>
                    <Typography variant="subtitle1">
                        Покупатель: {order.buyerUsername} ({order.buyerEmail})
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                        Адрес: {order.shippingAddress || "не указан"} | Дата:{" "}
                        {new Date(order.orderDate).toLocaleDateString()}
                    </Typography>
                    <Divider sx={{ my: 2 }} />

                    {order.items.map((item) => (
                        <Box
                            key={item.id}
                            sx={{
                                mb: 2,
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center"
                            }}
                        >
                            <Box>
                                <Typography>
                                    <strong>{item.productName}</strong> × {item.quantity} — {item.price} ₽
                                    <Chip
                                        label={item.orderItemStatus}
                                        color={statusColors[item.orderItemStatus] || "default"}
                                        size="small"
                                        sx={{ ml: 1 }}
                                    />
                                </Typography>
                                <FormControl sx={{ mt: 1, minWidth: 160 }} size="small">
                                    <InputLabel>Изменить статус</InputLabel>
                                    <Select
                                        label="Изменить статус"
                                        value={item.orderItemStatus}
                                        onChange={(e) => handleStatusChange(item.id, e.target.value)}
                                    >
                                        {statusOptions.map((status) => (
                                            <MenuItem key={status} value={status}>
                                                {status}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Box>
                        </Box>
                    ))}
                </Paper>
            ))}
        </Box>
    );
};

export default SellerOrders;
