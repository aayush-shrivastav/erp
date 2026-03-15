import { useState, useCallback } from 'react';

const useModal = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [data, setData] = useState(null);

    const openModal = useCallback((modalData = null) => {
        setData(modalData);
        setIsOpen(true);
    }, []);

    const closeModal = useCallback(() => {
        setIsOpen(false);
        setData(null);
    }, []);

    return { isOpen, data, openModal, closeModal };
};

export default useModal;
