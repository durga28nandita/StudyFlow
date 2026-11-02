// Read a value from LocalStorage (returns fallback if missing or broken)
export function loadData(key, fallback) {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch (error) {
    console.error("Could not load data:", error);
    return fallback;
  }
}

// Save a value to LocalStorage
export function saveData(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error("Could not save data:", error);
  }
}