import React, { useEffect, useState } from "react";
import {
    Card,
    CardContent,
    Typography,
    Button,
    CardActions,
    CardMedia,
    CircularProgress,
    Alert,
    Stack,
    Box,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem
} from "@mui/material";
import { Pagination } from "@mui/material";
import { useAuth } from "../../contexts/AuthContext";
import { Link } from "react-router-dom";
/**
 * Интерфейс описывает товар, отображаемый в магазине.
 */
interface Product {
    id: number;
    name: string;
    description: string;
    price: number;
    imageData?: string;
    isAvailable: boolean;
    categoryName?: string;
}
/**
 * Компонент отображает список всех доступных товаров в виде магазина.
 * Поддерживает фильтрацию по категории, поиск по названию, смену режима отображения и пагинацию.
 *
 * @component
 * @example
 * return <Shop />;
 */

const Shop: React.FC = () => {
    const { userId } = useAuth();
    const [products, setProducts] = useState<Product[]>([]);
    const [filtered, setFiltered] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState<string | null>(null);
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("Все");
    const [view, setView] = useState<"grid" | "list">("grid");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;

    const pageCount = Math.ceil(filtered.length / itemsPerPage);
    const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    /**
     * Загружает все доступные товары и применяет начальную фильтрацию.
     */
    const loadProducts = async () => {
        setLoading(true);
        const res = await fetch("/api/product");
        const data = (await res.json()) as Product[];
        const available = data.filter((p) => p.isAvailable);
        setProducts(available);
        setFiltered(available);
        setLoading(false);
    };
    /**
     * Уникальные категории на основе списка товаров.
     */
    const categoryOptions: string[] = ["Все", ...Array.from(
        new Set(
            products
                .map((p) => p.categoryName)
                .filter((name): name is string => typeof name === "string" && name.trim() !== "")
        )
    )];
    /**
     * Применяет фильтрацию по названию и категории.
     */
    const applyFilters = () => {
        const lower = search.toLowerCase();
        const result = products.filter(
            (p) =>
                p.name.toLowerCase().includes(lower) &&
                (category === "Все" || p.categoryName === category)
        );
        setFiltered(result);
    };

    useEffect(() => {
        applyFilters();
    }, [search, category, products]);
    /**
     * Добавляет товар в корзину текущего пользователя.
     * @param productId ID товара
     */

    const addToCart = async (productId: number) => {
        const res = await fetch("/api/orderitem/cart", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ productId, quantity: 1 })
        });

        if (res.ok) {
            setMessage("✅ Товар добавлен в корзину");
        } else {
            const err = await res.text();
            setMessage("❌ Ошибка: " + err);
        }
    };

    useEffect(() => {
        loadProducts();
    }, []);

    if (loading) return <CircularProgress sx={{ mt: 4 }} />;

    return (
        <>
            <Typography variant="h5" gutterBottom>
                Каталог товаров
            </Typography>

            {message && (
                <Alert severity={message.startsWith("✅") ? "success" : "error"} sx={{ mb: 2 }}>
                    {message}
                </Alert>
            )}

            <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mb: 2 }}>
                <TextField
                    label="Поиск по названию"
                    variant="outlined"
                    fullWidth
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <FormControl fullWidth>
                    <InputLabel>Категория</InputLabel>
                    <Select
                        value={category}
                        label="Категория"
                        onChange={(e) => setCategory(e.target.value)}
                    >
                        {categoryOptions.map((cat) => (
                            <MenuItem key={cat} value={cat}>
                                {cat}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <Stack direction="row" spacing={1}>
                    <Button
                        variant={view === "grid" ? "contained" : "outlined"}
                        onClick={() => setView("grid")}
                    >
                        🔲 Сетка
                    </Button>
                    <Button
                        variant={view === "list" ? "contained" : "outlined"}
                        onClick={() => setView("list")}
                    >
                        📄 Список
                    </Button>
                </Stack>
            </Stack>

            {filtered.length === 0 ? (
                <Typography>❌ Нет подходящих товаров.</Typography>
            ) : (
                <Box
                    sx={{
                        display: "flex",
                        flexDirection: view === "grid" ? "row" : "column",
                        flexWrap: view === "grid" ? "wrap" : "nowrap",
                        gap: 3
                    }}
                >
                    {paginated.map((product) => (
                        <Card
                            key={product.id}
                            sx={{
                                width: view === "grid" ? 300 : "100%",
                                display: "flex",
                                flexDirection: view === "list" ? "row" : "column"
                            }}
                        >
                            {product.imageData && (
                                <CardMedia
                                    component="img"
                                    height={view === "grid" ? 140 : 120}
                                    image={`data:image/jpeg;base64,${product.imageData}`}
                                    alt={product.name}
                                    sx={{ width: view === "list" ? 120 : "100%" }}
                                />
                            )}
                            <Box sx={{ flex: 1 }}>
                                <CardContent>
                                    <Typography variant="h6">{product.name}</Typography>
                                    <Typography variant="body2">{product.description}</Typography>
                                    <Typography variant="subtitle1" sx={{ mt: 1 }}>
                                        {product.price} ₽
                                    </Typography>
                                    <Typography variant="caption" display="block">
                                        Категория: {product.categoryName || "—"}
                                    </Typography>
                                </CardContent>
                                <CardActions>
                                    <Button
                                        variant="outlined"
                                        component={Link}
                                        to={`/product/${product.id}`}
                                    >
                                        🔍 Подробнее
                                    </Button>
                                    <Button
                                        variant="contained"
                                        onClick={() => addToCart(product.id)}
                                    >
                                        🛒 В корзину
                                    </Button>
                                </CardActions>
                            </Box>

                        </Card>

                    ))}
                </Box>

            )}
            {pageCount > 1 && (
                <Box sx={{ mt: 4, display: "flex", justifyContent: "center" }}>
                    <Pagination
                        count={pageCount}
                        page={currentPage}
                        onChange={(_, page) => setCurrentPage(page)}
                        color="primary"
                    />
                </Box>
            )}
        </>
    );
};

export default Shop;
