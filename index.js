import dotenv from 'dotenv';
import express from 'express';
import indexRoutes from './modules/index/index.routes.js';
dotenv.config();
const app = express();
app.use(express.json());
// Routes
app.use("/",indexRoutes);

app.listen(process.env.PORT, () => {
    console.log('Server is running on port ' + process.env.PORT);
});
