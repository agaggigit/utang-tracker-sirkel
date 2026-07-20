import express from 'express';
import cors from 'cors';
import { registerRouter } from "./users/registerUser";
import { loginRouter } from "./users/loginUser";
import { googleAuthRouter } from "./users/googleAuth";
import { profileRouter } from "./users/profile";
import { groupRouter } from './groups/group';
import { authenticate } from "./middleware/auth"

const app = express();
const port = 3000;

// Middleware agar bisa menerima request JSON
app.use(express.json());

app.use(cors());

app.use('/auth', registerRouter);
app.use('/auth', loginRouter);
app.use('/auth', googleAuthRouter);

app.use('/users', profileRouter);
app.use('/groups', groupRouter);

// Rute tes dasar
app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend Bill Splitter menyala!' });
});

app.get('/api/me', authenticate, (req, res) => {
  res.json({
    message: "Selamat datang, token kamu asli",
    user: res.locals.user
  });
});

// Menjalankan server
app.listen(port, () => {
  console.log(`Server berjalan di http://localhost:${port}`);
});
