// Script to clear Sanity cache and resolve transaction errors
// Run this in your browser console while in Sanity Studio

// 1. Clear all localStorage data for Sanity
Object.keys(localStorage).forEach(key => {
  if (key.includes('sanity') || key.includes('transaction')) {
    localStorage.removeItem(key);
    console.log(`Removed: ${key}`);
  }
});

// 2. Clear sessionStorage
Object.keys(sessionStorage).forEach(key => {
  if (key.includes('sanity') || key.includes('transaction')) {
    sessionStorage.removeItem(key);
    console.log(`Removed from session: ${key}`);
  }
});

// 3. Clear IndexedDB (Sanity stores some data here)
if ('indexedDB' in window) {
  indexedDB.databases().then(databases => {
    databases.forEach(db => {
      if (db.name && db.name.includes('sanity')) {
        indexedDB.deleteDatabase(db.name);
        console.log(`Deleted IndexedDB: ${db.name}`);
      }
    });
  });
}

console.log('Sanity cache cleared! Please refresh the page.');