/**
 * Mongoose plugin: clean JSON output — expose `id`, drop `_id`/`__v`,
 * and never leak the password field.
 */
module.exports = function toJSON(schema) {
  schema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.password;
      return ret;
    },
  });
};
