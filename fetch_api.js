fetch('http://localhost:3000/api/listings/bounds', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({ minLat: 45.0, maxLat: 46.0, minLng: -76.0, maxLng: -75.0, cityFilter: 'Ottawa' })
})
.then(r => r.text())
.then(text => console.log('API RESPONSE:', text))
.catch(console.error);
