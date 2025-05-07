/**
 * Сохраняет информацию о пользователе в localStorage.
 *
 * @param id - Уникальный идентификатор пользователя.
 * @param role - Роль пользователя (например, "Buyer" или "Seller").
 * @param username - Имя пользователя.
 */
export const setUserToStorage = (id: string, role: string, username: string) => {
    localStorage.setItem("userId", id);
    localStorage.setItem("role", role);
    localStorage.setItem("username", username);
};
/**
 * Удаляет информацию о пользователе из localStorage.
 */
export const clearUserFromStorage = () => {
    localStorage.removeItem("userId");
    localStorage.removeItem("role");
    localStorage.removeItem("username");
};
/**
 * Извлекает информацию о пользователе из localStorage.
 *
 * @returns Объект с полями userId, role и username (все могут быть null, если не установлены).
 */
export const getUserFromStorage = () => {
    return {
        userId: localStorage.getItem("userId"),
        role: localStorage.getItem("role"),
        username: localStorage.getItem("username"),
    };
};