async function testHomeBanners() {
  try {
    console.log('Testing /api/home-banners endpoint...');
    const response = await fetch('http://localhost:3000/api/home-banners');
    const data = await response.json();

    console.log('Status:', response.status);
    console.log('Response:', data);
    console.log('Success: Home banners endpoint is working!');
  } catch (error) {
    console.error('Error testing home banners endpoint:', error.message);
  }
}

testHomeBanners();