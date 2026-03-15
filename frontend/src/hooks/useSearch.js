import { useState } from 'react';

const useSearch = (data, searchFields) => {
  const [query, setQuery] = useState("");

  const filtered = query.trim() === ""
    ? data
    : data.filter(item =>
        searchFields.some(field =>
          String(item[field] ?? "").toLowerCase().includes(query.toLowerCase())
        )
      );

  return { query, setQuery, filtered };
};

export default useSearch;
