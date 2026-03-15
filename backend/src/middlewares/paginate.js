/**
 * Middleware to handle pagination logic.
 * Reads 'page' and 'limit' from query parameters and attaches skip/take to req.
 */
const paginate = (req, res, next) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    req.pagination = {
        skip,
        take: limit,
        page,
        limit
    };

    next();
};

module.exports = { paginate };
