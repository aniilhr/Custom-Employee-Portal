require('dotenv').config();
const express = require('express');
const cors = require('cors');

const { sequelize } = require('./src/models');
const authRoutes = require('./src/routes/authRoutes');
const zohoRoutes = require('./src/routes/zohoRoutes');
const adminRoutes = require('./src/routes/adminRoutes');
const errorHandler = require('./src/middlewares/errorHandler');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/auth', authRoutes);
app.use('/api/zoho', zohoRoutes);
app.use('/api/admin', adminRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

async function start() {
  try {
    await sequelize.authenticate();
    // Use { force: true } only via the seed script; here we just sync schema if missing.
    await sequelize.sync();
    app.listen(PORT, () => console.log(`Employee Portal API running on http://localhost:${PORT}`));
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

start();
