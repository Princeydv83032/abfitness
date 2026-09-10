const { z } = require('zod')

// Har jagah 10-digit Indian phone number isi shape mein aata hai
const phone10 = z.string().regex(/^\d{10}$/, 'must be a 10-digit number')

// Lat/lng dono number aur string (geolocation se seedha, ya form input se)
// dono form mein aa sakte hain - koi bhi accept karo, backend jahan zaroorat
// ho wahan khud parseFloat karta hai
const latLng = z.union([z.string(), z.number()]).nullable().optional()

module.exports = { phone10, latLng }
