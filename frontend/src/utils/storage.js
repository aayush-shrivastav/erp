/**
 * Safe localStorage wrapper to prevent crashes in private modes
 * and handle serialization errors.
 */
export const storage = {
    get: (key, fallback = null) => {
        try {
            const item = localStorage.getItem(key);
            if (item === null) return fallback;
            return JSON.parse(item);
        } catch (error) {
            console.error(`Error reading key "${key}" from localStorage:`, error);
            return fallback;
        }
    },
    
    set: (key, value) => {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error(`Error writing key "${key}" to localStorage:`, error);
            return false;
        }
    },
    
    remove: (key) => {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error(`Error removing key "${key}" from localStorage:`, error);
            return false;
        }
    },
    
    clear: () => {
        try {
            localStorage.clear();
            return true;
        } catch (error) {
            console.error('Error clearing localStorage:', error);
            return false;
        }
    }
};
