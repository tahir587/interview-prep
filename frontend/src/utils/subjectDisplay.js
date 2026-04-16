const ACRONYM_MAP = {
  oop: "OOP",
  oops: "OOPs",
  dbms: "DBMS",
  dsa: "DSA",
  os: "OS",
  cn: "CN",
  ai: "AI",
  ml: "ML",
  nlp: "NLP",
  sql: "SQL",
  oopm: "OOPM",
};

const formatToken = (token) => {
  if (!token) return "";

  const lower = token.toLowerCase();

  if (ACRONYM_MAP[lower]) {
    return ACRONYM_MAP[lower];
  }

  return token.charAt(0).toUpperCase() + token.slice(1).toLowerCase();
};

export const formatSubjectName = (name = "") => {
  const normalized = name
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!normalized) return "";

  return normalized
    .split(" ")
    .map(formatToken)
    .join(" ");
};

export const stripHtml = (value = "") =>
  value
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
