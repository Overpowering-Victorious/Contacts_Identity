import express from 'express';
import dotenv from 'dotenv';
import identifyRoutes from './routes/identify';
import testRoutes from './routes/test';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use('/test', testRoutes);
app.use('/api', identifyRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});