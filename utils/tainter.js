/**
 * Middleware which adds taint labels to all body parts of the request.
 */
module.exports = function tainter(req, res, next) {
  if (req.body == null) { return next(); }
  req.body = taintRecursively(req.body, "req.body");
  next();
}

/**
 * Adds taint recursively to the given obj.
 * @param {*} obj to be tainted
 * @param {*} taint initial taint label
 * @returns tainted obj
 */
function taintRecursively(obj, taint) {
  if (taint == null) { taint = ""; }
  for (const key of Object.keys(obj)) {
    const entry = obj[key];
    if (typeof entry === "object" && entry !== null) {
      obj[key] = taintRecursively(entry, `${taint}.${key}`); 
    }
    else if (typeof entry === "string" || entry instanceof String) {
      obj[key] = Taint.addTaint(entry, `${taint}.${key}`);
    }
  }
  return obj;
}