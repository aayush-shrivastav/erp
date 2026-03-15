import { useState, useEffect } from 'react';

const usePagination = (data, rowsPerPage = 10) => {
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(data.length / rowsPerPage));
  const safePage = Math.min(page, totalPages);
  
  const start = (safePage - 1) * rowsPerPage;
  const end = Math.min(start + rowsPerPage, data.length);
  const paginated = data.slice(start, end);

  // Reset to page 1 when data changes (e.g., after search filter)
  useEffect(() => {
    setPage(1);
  }, [data.length]);

  return {
    page: safePage,
    setPage,
    totalPages,
    paginated,
    start: data.length === 0 ? 0 : start + 1,
    end,
    total: data.length
  };
};

export default usePagination;
