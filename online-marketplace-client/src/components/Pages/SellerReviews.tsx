import React, { useEffect, useState } from "react";
import {
    Box,
    Typography,
    Paper,
    CircularProgress,
    Alert,
    TextField,
    Button
} from "@mui/material";
/**
 * Интерфейс для отзыва с возможным ответом продавца.
 */

interface Review {
    id: number;
    productId: number;
    productName?: string;
    text: string;
    rating: number;
    reply?: string;
}
/**
 * Компонент отображает список отзывов, оставленных на товары текущего продавца,
 * и предоставляет возможность ответить на каждый отзыв.
 *
 * @component
 * @example
 * return <SellerReviews />;
 */
const SellerReviews: React.FC = () => {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [replies, setReplies] = useState<Record<number, string>>({});
    /**
     * Загружает отзывы продавца с сервера.
     */
    const loadReviews = async () => {
        try {
            const res = await fetch("/api/review/seller");
            if (!res.ok) throw new Error("Ошибка загрузки отзывов");
            const data = await res.json();
            setReviews(data);
        } catch (err) {
            setError("❌ Не удалось загрузить отзывы");
        } finally {
            setLoading(false);
        }
    };
    /**
     * Отправляет ответ на отзыв.
     *
     * @param reviewId Идентификатор отзыва
     */
    const sendReply = async (reviewId: number) => {
        const reply = replies[reviewId];
        if (!reply?.trim()) return;

        const res = await fetch(`/api/review/${reviewId}/reply`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(reply)
        });

        if (res.ok) {
            await loadReviews();
            setReplies(prev => ({ ...prev, [reviewId]: "" }));
        } else {
            alert("❌ Не удалось отправить ответ");
        }
    };

    useEffect(() => {
        loadReviews();
    }, []);

    if (loading) return <CircularProgress />;
    if (error) return <Alert severity="error">{error}</Alert>;

    return (
        <Box>
            <Typography variant="h5" gutterBottom>
                Отзывы на ваши товары
            </Typography>

            {reviews.map(review => (
                <Paper key={review.id} sx={{ p: 2, mb: 2 }}>
                    <Typography variant="subtitle2">
                        🛍 {review.productName || `Товар #${review.productId}`}
                    </Typography>
                    <Typography>⭐ {review.rating}</Typography>
                    <Typography>{review.text}</Typography>

                    {review.reply ? (
                        <Typography sx={{ mt: 1, fontStyle: "italic", color: "gray" }}>
                            Ответ: {review.reply}
                        </Typography>
                    ) : (
                        <>
                            <TextField
                                fullWidth
                                size="small"
                                label="Ваш ответ"
                                value={replies[review.id] || ""}
                                onChange={(e) =>
                                    setReplies((prev) => ({ ...prev, [review.id]: e.target.value }))
                                }
                                sx={{ mt: 1 }}
                            />
                            <Button
                                variant="contained"
                                sx={{ mt: 1 }}
                                onClick={() => sendReply(review.id)}
                            >
                                Отправить
                            </Button>
                        </>
                    )}
                </Paper>
            ))}
        </Box>
    );
};

export default SellerReviews;
