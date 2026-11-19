const express = require('express');
const authrouter = require('./routes/auth.route.js');
const accountRouter = require('./routes/account.route.js');
const transactionRouter = require('./routes/transaction.routes.js');
const cookieparser = require('cookie-parser');

const app = express();



app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    status: "OK",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});


app.use(express.json());
app.use(cookieparser());
app.use('/api/auth',authrouter);
app.use('/api/account',accountRouter);
app.use('/api/transaction',transactionRouter);

app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

module.exports = app;