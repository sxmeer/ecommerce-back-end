exports.removeUnncessaryFields = (object) => {
  object.__v = undefined;
  object.createdAt = undefined;
  object.updatedAt = undefined;
  return object;
};