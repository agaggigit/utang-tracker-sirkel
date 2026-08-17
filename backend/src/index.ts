import express from 'express';
import cors from 'cors';
import { registerRouter } from "./users/registerUser";
import { loginRouter } from "./users/loginUser";
import { googleAuthRouter } from "./users/googleAuth";
import { profileRouter } from "./users/profile";
import { createGroupRouter } from './groups/createGroup';
import { joinGroupRouter } from './groups/joinGroup';
import { joinRequestRouter } from './groups/joinRequests';
import { authenticate } from "./middleware/auth"
import { groupSettingsRouter } from './groups/groupSettings';
import { getGroupDetailsRouter } from './groups/getGroupDetails';
import { joinRequestNotificationRouter } from './notifications/joinRequestNotifications';
import { createExpenseRouter } from './expenses/createExpense';
import { getExpensesRouter } from './expenses/getExpenses';
import { getGroupMembersRouter } from './groups/getGroupMembers';
import { getExpenseDetailRouter } from './expenses/getExpenseDetail';
import { createPaymentRouter } from './payments/createPayment';

const app = express();
const port = 3000;

// Middleware agar bisa menerima request JSON
app.use(express.json());

app.use(cors());

app.use('/auth', registerRouter);
app.use('/auth', loginRouter);
app.use('/auth', googleAuthRouter);

app.use('/users', profileRouter);

app.use('/groups', createGroupRouter);
app.use('/groups', joinGroupRouter);
app.use('/groups', joinRequestRouter);
app.use('/groups', groupSettingsRouter);
app.use('/groups', getGroupDetailsRouter);
app.use('/groups', getGroupMembersRouter);
app.use('/groups', createExpenseRouter);
app.use('/groups', getExpensesRouter);

app.use('/expenses', getExpenseDetailRouter);
app.use('/payments', createPaymentRouter);

app.use('/notifications', joinRequestNotificationRouter)

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
