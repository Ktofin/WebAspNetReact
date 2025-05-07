import React, { useEffect, useState } from "react";
import {
    Typography,
    Paper,
    Box,
    CircularProgress,
    Divider
} from "@mui/material";
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    Legend,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    ResponsiveContainer
} from "recharts";
import { useAuth } from "../../contexts/AuthContext";
/**
 * Интерфейс продукта с количеством продаж.
 */
interface Product {
    id: number;
    name: string;
    totalSold: number;
}
/**
 * Интерфейс единицы заказа.
 */

interface OrderItem {
    productId: number;
    quantity: number;
}
/**
 * Интерфейс заказа.
 */

interface Order {
    id: number;
    orderDate: string;
    orderStatus: string;
    shippingAddress: string;
    totalAmount: number;
    items: OrderItem[]; // 👈 вот это нужно добавить
}


const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042"];
/**
 * Главная страница продавца — статистика и визуализация данных.
 *
 * Отображает:
 * - общее количество товаров и заказов;
 * - круговую диаграмму по статусам заказов;
 * - гистограмму по топ-3 продаваемым товарам.
 *
 * @component
 * @example
 * return <SellerHome />;
 */
const SellerHome: React.FC = () => {
    const { username } = useAuth();
    const [loading, setLoading] = useState(true);
    const [products, setProducts] = useState<Product[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    /**
     * Загружает данные товаров и заказов продавца.
     */
    useEffect(() => {
        const loadStats = async () => {
            try {
                const [productsRes, ordersRes] = await Promise.all([
                    fetch("/api/product/mine"),
                    fetch("/api/order/seller")
                ]);
                const productsData = await productsRes.json();
                const ordersData = await ordersRes.json();
                setProducts(productsData);
                setOrders(ordersData);
            } catch (err) {
                console.error("Ошибка при загрузке данных продавца", err);
            } finally {
                setLoading(false);
            }
        };

        loadStats();
    }, []);

    if (loading) return <CircularProgress />;

    const productCount = products.length;
    const orderCount = orders.length;
    const soldMap: { [productId: number]: number } = {};


// Подсчёт количества продаж каждого товара
    orders.forEach(order => {
        order.items?.forEach(item => {
            soldMap[item.productId] = (soldMap[item.productId] || 0) + item.quantity;
        });
    });

// Формируем массив с названиями и количеством продаж
    const topProducts = products
        .map(product => ({
            name: product.name,
            sales: soldMap[product.id] || 0
        }))
        .filter(p => p.sales > 0) // исключаем товары без продаж
        .sort((a, b) => b.sales - a.sales)
        .slice(0, 3);

    const statusCounts: { [key: string]: number } = {};
    orders.forEach(order => {
        statusCounts[order.orderStatus] = (statusCounts[order.orderStatus] || 0) + 1;
    });

    const statusData = Object.entries(statusCounts).map(([status, count]) => ({
        name: status,
        value: count
    }));



    return (
        <Box>
            <Typography variant="h4" gutterBottom>
                Добро пожаловать, {username}!
            </Typography>

            <Paper sx={{ p: 3, mb: 4 }}>
                <Typography variant="h6">📊 Статистика:</Typography>
                <Divider sx={{ my: 1 }} />
                <Typography>📦 Всего товаров: {productCount}</Typography>
                <Typography>🧾 Всего заказов: {orderCount}</Typography>
            </Paper>

            <Box sx={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                <Paper sx={{ flex: 1, minWidth: 300, p: 2 }}>
                    <Typography variant="h6" gutterBottom>
                        Статусы заказов
                    </Typography>
                    <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                            <Pie
                                data={statusData}
                                dataKey="value"
                                nameKey="name"
                                outerRadius={80}
                                label
                            >
                                {statusData.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={COLORS[index % COLORS.length]}
                                    />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </Paper>

                <Paper sx={{ flex: 1, minWidth: 300, p: 2 }}>
                    <Typography variant="h6" gutterBottom>
                        Топ-3 продаваемых товара
                    </Typography>
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={topProducts}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="sales" fill="#7e57c2" />
                        </BarChart>
                    </ResponsiveContainer>
                </Paper>
            </Box>
        </Box>
    );
};

export default SellerHome;
