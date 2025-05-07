import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Box,
    Typography,
    MenuItem
} from '@mui/material';
import { Product } from '../../models/Product';

/**
 * Интерфейс категории, получаемой с API.
 */
interface Category {
    id: number;
    name: string;
}

/**
 * Свойства компонента редактирования товара.
 * @property {boolean} open - Флаг отображения диалога.
 * @property {() => void} onClose - Закрывает диалог.
 * @property {Product} product - Продукт, который нужно отредактировать.
 * @property {(updated: Product) => void} onUpdate - Колбэк после успешного обновления.
 */
interface Props {
    open: boolean;
    onClose: () => void;
    product: Product;
    onUpdate: (updated: Product) => void;
}

/**
 * Модальное окно редактирования товара.
 *
 * Позволяет изменить название, описание, цену, категорию и изображение.
 * После сохранения отправляет PUT-запрос и вызывает `onUpdate`.
 *
 * @component
 * @example
 * <EditProductDialog
 *   open={true}
 *   product={product}
 *   onClose={() => setDialogOpen(false)}
 *   onUpdate={(updated) => updateProductInState(updated)}
 * />
 */
const EditProductDialog: React.FC<Props> = ({ open, onClose, product, onUpdate }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState(0);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(product.imageData || null);
    const [categoryId, setCategoryId] = useState(product.categoryId);
    const [categories, setCategories] = useState<Category[]>([]);

    useEffect(() => {
        setName(product.name);
        setDescription(product.description);
        setPrice(product.price);
        setImagePreview(product.imageData || null);
        setCategoryId(product.categoryId);
    }, [product]);

    useEffect(() => {
        const loadCategories = async () => {
            const res = await fetch('/api/category');
            const data = await res.json();
            setCategories(data);
        };
        loadCategories();
    }, []);

    /**
     * Обрабатывает загрузку нового изображения и формирует preview.
     */
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        setImageFile(file);

        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        } else {
            setImagePreview(product.imageData || null);
        }
    };

    /**
     * Конвертирует изображение в base64.
     * Если изображение не выбрано, используется текущее.
     */
    const convertImageToBase64 = (): Promise<string> => {
        return new Promise((resolve, reject) => {
            if (!imageFile) return resolve(product.imageData || '');
            const reader = new FileReader();
            reader.onload = () => {
                const base64 = reader.result as string;
                const cleanBase64 = base64.split(',')[1];
                resolve(cleanBase64);
            };
            reader.onerror = reject;
            reader.readAsDataURL(imageFile);
        });
    };
    /**
     * Обрабатывает сохранение обновлённого товара.
     */
    const handleSave = async () => {
        const imageData = await convertImageToBase64();
        const currentCategory = categories.find(c => c.id === categoryId);
        const categoryName = currentCategory?.name || '';

        const updatedProduct: Product = {
            ...product,
            name,
            description,
            price,
            imageData,
            categoryId,
            categoryName, // ✅ теперь точно корректно
            sellerId: product.sellerId,
            sellerUsername: product.sellerUsername,
            isAvailable: product.isAvailable,
            creationDate: product.creationDate
        };

        const res = await fetch(`/api/product/${product.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedProduct)
        });

        if (res.ok) {
            onUpdate(updatedProduct);
            onClose();
        } else {
            const error = await res.text();
            alert(`❌ Ошибка при обновлении: ${error}`);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>Редактировать товар</DialogTitle>
            <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                <TextField
                    label="Название"
                    fullWidth
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
                <TextField
                    label="Описание"
                    fullWidth
                    multiline
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />
                <TextField
                    label="Цена"
                    type="number"
                    fullWidth
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                />

                <TextField
                    select
                    label="Категория"
                    value={categoryId}
                    onChange={(e) => setCategoryId(Number(e.target.value))}
                    fullWidth
                >
                    {categories.map(cat => (
                        <MenuItem key={cat.id} value={cat.id}>
                            {cat.name}
                        </MenuItem>
                    ))}
                </TextField>

                <Button variant="outlined" component="label">
                    Заменить изображение
                    <input type="file" accept="image/*" hidden onChange={handleImageChange} />
                </Button>

                {imagePreview && (
                    <Box>
                        <Typography variant="caption">Предпросмотр:</Typography>
                        <img
                            src={`data:image/jpeg;base64,${imagePreview}`}
                            alt="предпросмотр"
                            style={{ maxWidth: '100%', maxHeight: 150, objectFit: 'contain' }}
                        />
                    </Box>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Отмена</Button>
                <Button onClick={handleSave} variant="contained">
                    Сохранить
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default EditProductDialog;