import React, { useEffect, useState } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Button,
    CardActions,
    CircularProgress,
    Stack,
    TextField
} from '@mui/material';
import EditProductDialog from './EditProductDialog';
import { Product } from '../../models/Product';
/**
 * Компонент отображения товаров текущего продавца.
 *
 * Поддерживает:
 * - Загрузку списка товаров с API
 * - Фильтрацию по названию
 * - Редактирование и удаление товаров
 * - Предпросмотр изображений и информации о товаре
 *
 * @component
 * @example
 * return <MyProducts />;
 */
const MyProducts: React.FC = () => {
    const [allProducts, setAllProducts] = useState<Product[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [editOpen, setEditOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [search, setSearch] = useState("");

    /**
     * Открывает диалог редактирования выбранного товара.
     * @param product - Товар, который нужно редактировать.
     */
    const handleEditClick = (product: Product) => {
        setSelectedProduct(product);
        setEditOpen(true);
    };
    /**
     * Закрывает диалог редактирования.
     */
    const handleEditClose = () => {
        setEditOpen(false);
        setSelectedProduct(null);
    };
    /**
     * Обновляет товар в списке после редактирования.
     * @param updated - Обновлённый товар.
     */
    const handleUpdateProduct = (updated: Product) => {
        setAllProducts(prev => prev.map(p => (p.id === updated.id ? updated : p)));
        applyFilter(search);
    };
    /**
     * Загружает список товаров продавца.
     */
    const loadProducts = async () => {
        try {
            const res = await fetch('/api/product/mine');
            if (!res.ok) throw new Error("Ошибка загрузки товаров");
            const data = await res.json();
            setAllProducts(data);
            setProducts(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };
    /**
     * Фильтрует список товаров по названию.
     * @param value - Поисковая строка.
     */
    const applyFilter = (value: string) => {
        setSearch(value);
        const lower = value.toLowerCase();
        const filtered = allProducts.filter(p => p.name.toLowerCase().includes(lower));
        setProducts(filtered);
    };
    /**
     * Удаляет товар по ID.
     * @param id - Идентификатор товара.
     */
    const handleDelete = async (id: number) => {
        if (!window.confirm("Удалить этот товар?")) return;
        const res = await fetch(`/api/product/${id}`, { method: "DELETE" });
        if (res.ok) {
            const updated = allProducts.filter(p => p.id !== id);
            setAllProducts(updated);
            applyFilter(search);
        } else {
            alert("Ошибка при удалении");
        }
    };

    useEffect(() => {
        loadProducts();
    }, []);

    if (loading) return <CircularProgress />;
    if (error) return <Typography color="error">{error}</Typography>;

    return (
        <>
            <TextField
                label="Поиск по названию"
                fullWidth
                sx={{ mb: 2 }}
                value={search}
                onChange={(e) => applyFilter(e.target.value)}
            />

            {products.length === 0 ? (
                <Typography>Нет подходящих товаров.</Typography>
            ) : (
                <Stack spacing={2}>
                    {products.map(product => (
                        <Card key={product.id}>
                            <CardContent>
                                <Typography variant="h6">{product.name}</Typography>
                                {product.imageData && (
                                    <Box sx={{ mb: 1 }}>
                                        <img
                                            src={`data:image/jpeg;base64,${product.imageData}`}
                                            alt={product.name}
                                            style={{ maxWidth: '100%', maxHeight: 150, objectFit: 'contain' }}
                                        />
                                    </Box>
                                )}
                                <Typography variant="body2" sx={{ mb: 1 }}>
                                    {product.description}
                                </Typography>
                                <Typography variant="subtitle2">
                                    Цена: {product.price} ₽
                                </Typography>
                                <Typography variant="caption" display="block">
                                    Категория: {product.categoryName}
                                </Typography>
                                {product.creationDate && (
                                    <Typography variant="caption" display="block">
                                        Создан: {new Date(product.creationDate).toLocaleDateString()}
                                    </Typography>
                                )}
                            </CardContent>
                            <CardActions>
                                <Button size="small" onClick={() => handleEditClick(product)}>
                                    ✏️ Редактировать
                                </Button>
                                <Button size="small" color="error" onClick={() => handleDelete(product.id)}>
                                    🗑 Удалить
                                </Button>
                            </CardActions>
                        </Card>
                    ))}
                </Stack>
            )}

            {selectedProduct && (
                <EditProductDialog
                    open={editOpen}
                    onClose={handleEditClose}
                    product={selectedProduct}
                    onUpdate={handleUpdateProduct}
                />
            )}
        </>
    );
};

export default MyProducts;
