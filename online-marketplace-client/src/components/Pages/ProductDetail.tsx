import React, { useEffect, useState } from "react";
import {
    Box,
    Typography,
    Paper,
    CircularProgress,
    TextField,
    Button,
    Divider,
    Stack
} from "@mui/material";
import { useParams } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { Rating } from "@mui/material";

/**
 * Интерфейс отзыва на товар.
 */
interface Review {
    id: number;
    text: string;
    rating: number;
    userId: string;
    reply?: string;
}
/**
 * Интерфейс сообщения между пользователем и продавцом.
 */
interface Message {
    id: number;
    senderId: string;
    content: string;
    sentAt: string;
}
/**
 * Интерфейс товара.
 */
interface Product {
    id: number;
    name: string;
    description: string;
    price: number;
    imageData?: string;
    sellerId: string;
}
/**
 * Компонент отображения страницы товара.
 *
 * Отображает:
 * - Информацию о товаре
 * - Возможность оставить отзыв (если доступно)
 * - Список отзывов
 * - Переписку с продавцом (чат)
 *
 * @component
 * @example
 * return <ProductDetail />;
 */

const ProductDetail: React.FC = () => {
    const { id } = useParams();
    const { userId } = useAuth();
    const [product, setProduct] = useState<Product | null>(null);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const [canReview, setCanReview] = useState(false);
    const [newReview, setNewReview] = useState("");
    const [rating, setRating] = useState<number | null>(3); // по умолчанию 3

    /**
     * Загружает данные товара по ID из URL.
     */
    const loadProduct = async () => {
        const res = await fetch(`/api/product/${id}`);
        const data = await res.json();
        setProduct(data);
    };
    /**
     * Проверяет, может ли пользователь оставить отзыв.
     */
    const checkReviewPermission = async () => {
        const res = await fetch(`/api/review/can-review/${id}`);
        if (res.ok) {
            const allowed = await res.json();
            setCanReview(allowed);
        }
    };
    /**
     * Загружает отзывы к текущему товару.
     */
    const loadReviews = async () => {
        try {
            const res = await fetch(`/api/review/product/${id}`);
            if (!res.ok) throw new Error("Ошибка загрузки отзывов");
            const data = await res.json();
            setReviews(data);
        } catch (err) {
            console.error("loadReviews:", err);
        }
    };
    /**
     * Отправляет новый отзыв.
     */
    const handleSendReview = async () => {
        if (!newReview.trim() || !product?.id) return;

        const res = await fetch("/api/review", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                productId: product.id,
                text: newReview,
                rating: rating ?? 3 // защита от null
            })
        });

        if (res.ok) {
            setNewReview("");
            loadReviews();
        } else {
            const error = await res.text();
            console.error("❌ Ошибка отправки отзыва:", error);
        }
    };
    /**
     * Загружает переписку с продавцом по товару.
     */
    const loadMessages = async () => {
        try {
            if (!product?.id || !product?.sellerId || !userId) return;
            const res = await fetch(
                `/api/message/chat?buyerId=${userId}&sellerId=${product.sellerId}&productId=${product.id}`
            );
            if (!res.ok) throw new Error("Ошибка загрузки сообщений");
            const text = await res.text();
            const data = text ? JSON.parse(text) : [];
            setMessages(data);
        } catch (err) {
            console.error("loadMessages:", err);
        }
    };
    /**
     * Отправляет новое сообщение продавцу.
     */
    const sendMessage = async () => {
        try {
            const res = await fetch("/api/message", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    content: newMessage,
                    receiverId: product?.sellerId,
                    productId: product?.id
                })
            });

            if (!res.ok) {
                const errorText = await res.text();  // 👈 важно для отладки
                throw new Error("❌ Ошибка отправки: " + errorText);
            }

            setNewMessage("");
            await loadMessages(); // 👈 обязательно жди завершения
        } catch (err) {
            console.error(err);
            alert((err as Error).message);
        }
    };



    useEffect(() => {
        loadProduct();
        loadReviews();
        loadMessages();
        setLoading(false);
        const interval = setInterval(() => {
            loadMessages(); // 🔄 обновление сообщений каждые 5 сек
        }, 5000);

        return () => clearInterval(interval); // очистка таймера
    }, [id]);
    useEffect(() => {
        if (product) {
            checkReviewPermission();
            loadReviews();
            loadMessages();
            const interval = setInterval(() => {
                loadMessages(); // 🔄 обновление сообщений каждые 5 сек
            }, 5000);
            return () => clearInterval(interval); // очистка таймера
        }
    }, [product]);
    if (loading || !product) return <CircularProgress />;

    return (
        <Box>
            <Typography variant="h4">{product.name}</Typography>
            <Typography>{product.description}</Typography>
            <Typography variant="h6" sx={{ mt: 2 }}>{product.price} ₽</Typography>

            {product.imageData && (
                <img
                    src={`data:image/jpeg;base64,${product.imageData}`}
                    alt={product.name}
                    style={{ maxWidth: "100%", marginTop: 16 }}
                />
            )}
            {canReview && (
                <Box sx={{ mt: 2 }}>
                    <Typography sx={{ mt: 2 }}>Ваша оценка:</Typography>
                    <Rating
                        name="user-rating"
                        value={rating}
                        onChange={(_, newValue) => setRating(newValue)}
                    />
                    <Typography variant="subtitle1">Оставить отзыв:</Typography>
                    <TextField
                        fullWidth
                        label="Отзыв"
                        multiline
                        rows={2}
                        value={newReview}
                        onChange={(e) => setNewReview(e.target.value)}
                    />
                    <Button sx={{ mt: 1 }} variant="contained" onClick={handleSendReview}>
                        Отправить
                    </Button>
                </Box>
            )}
            <Divider sx={{ my: 4 }} />

            <Box sx={{ display: "flex", gap: 4 }}>
                <Box sx={{ flex: 2 }}>
                    <Typography variant="h6">Отзывы</Typography>
                    {reviews.map((review) => (
                        <Paper key={review.id} sx={{ p: 2, my: 1 }}>
                            <Typography>⭐ {review.rating}</Typography>
                            <Typography>{review.text}</Typography>
                            {review.reply && (
                                <Typography sx={{ mt: 1, fontStyle: "italic", color: "gray" }}>
                                    Ответ продавца: {review.reply}
                                </Typography>
                            )}
                        </Paper>
                    ))}
                </Box>

                <Box sx={{ flex: 1 }}>
                    <Typography variant="h6">Переписка с продавцом</Typography>
                    <Stack spacing={1} sx={{ maxHeight: 300, overflowY: "auto", mt: 1 }}>
                        {messages.map((msg) => (
                            <Paper key={msg.id} sx={{ p: 1 }}>
                                <Typography variant="caption">
                                    {msg.senderId === userId ? "Вы" : "Продавец"}:
                                </Typography>
                                <Typography>{msg.content}</Typography>
                            </Paper>
                        ))}
                    </Stack>

                    <TextField
                        fullWidth
                        multiline
                        rows={2}
                        label="Сообщение"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        sx={{ mt: 2 }}
                    />
                    <Button
                        variant="contained"
                        fullWidth
                        onClick={sendMessage}
                        sx={{ mt: 1 }}
                        disabled={!newMessage.trim()}
                    >
                        Отправить
                    </Button>
                </Box>
            </Box>
        </Box>
    );
};

export default ProductDetail;
