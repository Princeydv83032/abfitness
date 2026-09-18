// Tab switch karte waqt har page dobara API call karke skeleton dikhata
// tha - chahe user 5 second pehle hi wahan tha. Ye ek simple in-memory
// cache hai: dubara aane par purana data TURANT dikh jaata hai (koi
// skeleton nahi) aur background mein fresh data aakar chup-chaap update
// kar deta hai. Isi ko stale-while-revalidate kehte hain, aur native
// app jaisi feel isi se aati hai.
//
// Memory-only hai (localStorage nahi) - app band hone par khatam, taaki
// kabhi bhi bahut purana data na dikhe. Logout par bhi clear hota hai.

const cache = new Map();

export function getCache(key) {
  return cache.get(key);
}

export function setCache(key, value) {
  cache.set(key, value);
}

export function hasCache(key) {
  return cache.has(key);
}

// Logout par zaroori hai - warna agle user ko pichhle user ka data
// ek pal ke liye dikh sakta hai
export function clearPageCache() {
  cache.clear();
}
