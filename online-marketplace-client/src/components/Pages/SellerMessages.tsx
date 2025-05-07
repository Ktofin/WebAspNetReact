import React, { useEffect, useState } from "react";
import {
        Box,
        Typography,
        List,
        ListItem,
        ListItemButton,
        ListItemText,
        Divider,
        Paper,
        CircularProgress,
        TextField,
        Button,
        Stack
} from "@mui/material";
import { useAuth } from "../../contexts/AuthContext";
/**
 * Интерфейс переписки (треда) между продавцом и покупателем.
 */
interface Thread {
        productId: number;
        productName: string;
        buyerId: string;
        lastMessage: string;
        lastDate: string;
}
/**
 * Интерфейс сообщения.
 */
interface Message {
        id: number;
        senderId: string;
        receiverId: string;
        content: string;
        sentAt: string;
        productId: number;
}
/**
 * Компонент отображает список переписок продавца и чат с покупателями по каждому товару.
 *
 * @component
 * @example
 * return <SellerMessages />;
 */
const SellerMessages: React.FC = () => {
        const { userId } = useAuth();
        const [threads, setThreads] = useState<Thread[]>([]);
        const [messages, setMessages] = useState<Message[]>([]);
        const [selected, setSelected] = useState<Thread | null>(null);
        const [newMessage, setNewMessage] = useState("");
        const [loading, setLoading] = useState(true);
        /**
         * Загружает список всех переписок продавца.
         */
        const loadThreads = async () => {
                setLoading(true);
                const res = await fetch("/api/message/threads");
                const data = await res.json();
                setThreads(data);
                setLoading(false);
        };
        /**
         * Загружает сообщения для выбранного треда.
         * @param thread Тред (переписка)
         */

        const loadMessages = async (thread: Thread) => {
                const res = await fetch(`/api/message/with/${thread.buyerId}?productId=${thread.productId}`);
                const data = await res.json();
                setMessages(data);
        };
        /**
         * Загружает сообщения для выбранного треда.
         * @param thread Тред (переписка)
         */

        const handleSend = async () => {
                if (!selected) return;
                const res = await fetch("/api/message", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                                content: newMessage,
                                receiverId: selected.buyerId,
                                productId: selected.productId
                        })
                });

                if (res.ok) {
                        setNewMessage("");
                        loadMessages(selected);
                }
        };
        /**
         * Инициализация: загрузка тредов и обновление каждые 5 секунд.
         */
        useEffect(() => {
                loadThreads();
                const interval = setInterval(() => {
                        loadThreads(); // 🔄 обновление сообщений каждые 5 сек
                }, 5000);
                return () => clearInterval(interval); // очистка таймера
        }, []);

        return (
            <Box sx={{ display: "flex", gap: 3 }}>
                    <Box sx={{ width: 300 }}>
                            <Typography variant="h6" gutterBottom>📨 Переписки</Typography>
                            {loading ? <CircularProgress /> : (
                                <List>
                                        {threads.map((thread, idx) => (
                                            <React.Fragment key={idx}>
                                                    <ListItem disablePadding>
                                                            <ListItemButton
                                                                selected={selected === thread}
                                                                onClick={() => {
                                                                        setSelected(thread);
                                                                        loadMessages(thread);
                                                                }}
                                                            >
                                                                    <ListItemText
                                                                        primary={thread.productName}
                                                                        secondary={thread.lastMessage}
                                                                    />
                                                            </ListItemButton>
                                                    </ListItem>
                                                    <Divider />
                                            </React.Fragment>
                                        ))}
                                </List>
                            )}
                    </Box>

                    <Box sx={{ flex: 1 }}>
                            {selected ? (
                                <>
                                        <Typography variant="h6">
                                                🧾 Чат по товару: {selected.productName}
                                        </Typography>
                                        <Paper sx={{ p: 2, maxHeight: 400, overflowY: "auto", mt: 1, mb: 2 }}>
                                                <Stack spacing={1}>
                                                        {messages.map((m) => (
                                                            <Box key={m.id} alignSelf={m.senderId === userId ? "flex-end" : "flex-start"}>
                                                                    <Typography variant="caption">
                                                                            {m.senderId === userId ? "Вы" : "Покупатель"}:
                                                                    </Typography>
                                                                    <Typography>{m.content}</Typography>
                                                            </Box>
                                                        ))}
                                                </Stack>
                                        </Paper>
                                        <TextField
                                            fullWidth
                                            multiline
                                            minRows={2}
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                            placeholder="Ваше сообщение..."
                                        />
                                        <Button
                                            variant="contained"
                                            onClick={handleSend}
                                            disabled={!newMessage.trim()}
                                            sx={{ mt: 1 }}
                                        >
                                                Отправить
                                        </Button>
                                </>
                            ) : (
                                <Typography>Выберите переписку слева</Typography>
                            )}
                    </Box>
            </Box>
        );
};

export default SellerMessages;
