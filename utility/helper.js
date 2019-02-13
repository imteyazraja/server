const isEmpty = value =>
  value === undefined ||
  value === null ||
  (typeof value === "object" && Object.keys(value).length === 0) ||
  (typeof value === "string" && value.trim().length === 0);

exports.isEmpty = isEmpty;

exports.trimObj = function trimObj(obj) {
  if (!Array.isArray(obj) && typeof obj != "object") return obj;
  return Object.keys(obj).reduce(function(acc, key) {
    if (typeof obj[key] == "string") {
      if (obj[key] !== null && obj[key] !== "") {
        acc[key.trim()] = obj[key].trim();
      } else {
        acc[key.trim()] = obj[key];
      }
    } else {
      acc[key.trim()] = trimObj(obj[key]);
    }
    return acc;
  }, Array.isArray(obj) ? [] : {});
};

exports.capitalize = str => {
  str = str.toLowerCase();
  return str.replace(/\b\w/g, l => l.toUpperCase());
};
