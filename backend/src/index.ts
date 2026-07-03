import express from 'express';

const app = express();
const port = 3000;

// Middleware agar bisa menerima request JSON
app.use(express.json());

// Rute tes dasar
app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend Bill Splitter menyala!' });
});

// Menjalankan server
app.listen(port, () => {
  console.log(`Server berjalan di http://localhost:${port}`);
});
