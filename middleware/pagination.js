const pagination = (req, res, next) => {
  const DEFAULT_PAGESIZE = 25;
  const MAX_PAGESIZE = 100;

  const rawPage = Number(req.query.page);
  const rawPageSize = Number(req.query.pageSize);

  const page = Number.isInteger(rawPage) && rawPage > 0 ? rawPage : 1;
  const pageSize = Number.isInteger(rawPageSize) && rawPageSize > 0 ? Math.min(rawPageSize, MAX_PAGESIZE) : DEFAULT_PAGESIZE;
  const offset = (page - 1) * pageSize;

  const cursor = req.query.startingAfter || null;

  const rawSort = req.query.sort || "-createdAt";
  const direction = rawSort.startsWith("-") ? -1 : 1;
  const field = rawSort.replace(/^-/, "");

  req.pagination = {
    page,
    pageSize,
    offset,
    cursor,
    sort: { [field]: direction },
  };

  next();
};

module.exports = pagination;
