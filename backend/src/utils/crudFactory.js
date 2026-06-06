const asyncHandler = require('./asyncHandler');
const ApiError = require('./ApiError');

/**
 * Generic CRUD controller builders for a Mongoose model.
 * `options.populate` is applied to list & get.
 */
function crudFactory(Model, options = {}) {
  const populate = options.populate || '';
  const sort = options.sort || '-createdAt';

  const list = asyncHandler(async (req, res) => {
    let q = Model.find().sort(sort);
    if (populate) q = q.populate(populate);
    const docs = await q;
    res.json({ success: true, data: docs, meta: { total: docs.length } });
  });

  const getOne = asyncHandler(async (req, res) => {
    let q = Model.findById(req.params.id);
    if (populate) q = q.populate(populate);
    const doc = await q;
    if (!doc) throw ApiError.notFound();
    res.json({ success: true, data: doc });
  });

  const create = asyncHandler(async (req, res) => {
    const doc = await Model.create(req.body);
    res.status(201).json({ success: true, data: doc });
  });

  const update = asyncHandler(async (req, res) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!doc) throw ApiError.notFound();
    res.json({ success: true, data: doc });
  });

  const remove = asyncHandler(async (req, res) => {
    const doc = await Model.findByIdAndDelete(req.params.id);
    if (!doc) throw ApiError.notFound();
    res.json({ success: true, data: { id: req.params.id } });
  });

  return { list, getOne, create, update, remove };
}

module.exports = crudFactory;
