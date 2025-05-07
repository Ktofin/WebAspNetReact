import React, { useEffect, useState } from "react";
import {
    Typography,
    Card,
    CardContent,
    TextField,
    Button,
    Box,
    Stack
} from "@mui/material";

/**
 * Модель одного товара в корзине (позиции заказа).
 */
interface OrderItem {
    id: number;
    productId: number;
    productName: string;
    productImage?: Uint8Array;
    quantity: number;
    price: number;
}
/**
 * Компонент отображения корзины пользователя.
 * Позволяет просматривать добавленные товары, удалять их, вводить адрес доставки и оформлять заказ.
 *
 * @component
 * @example
 * return <Cart />;
 */
const Cart: React.FC = () => {
    const [cartItems, setCartItems] = useState<OrderItem[]>([]);
    const [shippingAddress, setShippingAddress] = useState("");
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");

    useEffect(() => {
        const loadCart = async () => {
            const res = await fetch("/api/orderitem/cart");
            const data = await res.json();
            setCartItems(data);
            setLoading(false);
        };

        loadCart();
    }, []);

    /**
     * Вычисляет общую сумму заказа.
     * @returns Суммарная стоимость всех товаров в корзине.
     */
    const calculateTotal = () => {
        return cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    };

    /**
     * Отправляет заказ на сервер.
     * Включает адрес, товары и общую сумму.
     */
    const handleOrder = async () => {
        if (!shippingAddress) {
            setMessage("Введите адрес доставки");
            return;
        }

        const orderDto = {
            shippingAddress,
            orderStatus: "Pending",
            orderDate: new Date().toISOString(),
            totalAmount: calculateTotal(),
            items: cartItems
        };

        const res = await fetch("/api/order", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(orderDto)
        });

        if (res.ok) {
            setMessage("✅ Заказ успешно оформлен!");
            setCartItems([]);
        } else {
            const error = await res.text();
            setMessage("❌ Ошибка при оформлении: " + error);
        }
    };

    /**
     * Удаляет товар из корзины по его ID.
     * @param id - Идентификатор позиции заказа.
     */
    const handleDeleteFromCart = async (id: number) => {
        const res = await fetch(`/api/orderitem/cart/${id}`, {
            method: "DELETE"
        });

        if (res.ok) {
            setCartItems(prev => prev.filter(item => item.id !== id));
            setMessage("🗑️ Товар удалён из корзины");
        } else {
            const err = await res.text();
            setMessage("❌ Ошибка удаления: " + err);
        }
    };
    if (loading) return <Typography>Загрузка...</Typography>;

    return (
        <Box>
            <Typography variant="h5" gutterBottom>🛒 Корзина</Typography>

            {cartItems.length === 0 && <Typography>Корзина пуста</Typography>}

            <Stack spacing={2}>
                {cartItems.map((item) => (
                    <Card key={item.id}>
                        <CardContent>
                            <Typography variant="h6">{item.productName}</Typography>
                            <Typography>Количество: {item.quantity}</Typography>
                            <Typography>Цена за шт: {item.price} ₽</Typography>
                            <Typography>
                                Сумма: {(item.quantity * item.price).toFixed(2)} ₽
                            </Typography>
                        </CardContent>
                        <Box sx={{ px: 2, pb: 2 }}>
                            <Button
                                variant="outlined"
                                color="error"
                                onClick={() => handleDeleteFromCart(item.id)}
                            >
                                Удалить
                            </Button>
                        </Box>
                    </Card>
                ))}
            </Stack>


            {cartItems.length > 0 && (
                <>
                    <Typography sx={{ mt: 3 }} variant="h6">
                        Общая сумма: {calculateTotal().toFixed(2)} ₽
                    </Typography>

                    <TextField
                        label="Адрес доставки"
                        fullWidth
                        sx={{ mt: 2 }}
                        value={shippingAddress}
                        onChange={(e) => setShippingAddress(e.target.value)}
                    />

                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleOrder}
                        sx={{ mt: 2 }}
                    >
                        Оформить заказ
                    </Button>
                </>
            )}

            {message && <Typography sx={{ mt: 2 }}>{message}</Typography>}
        </Box>
    );
};

export default Cart;
