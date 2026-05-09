import express from 'express';
import 'dotenv/config';
import dimensionsRoutes from './routes/dimensions.routes.js';
import { notFoundHandler, errorHandler } from './middlewares/errorHandler.middleware.js';
import { errorSimulator } from './middlewares/errorSimulator.middleware.js';

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(errorSimulator);
app.use('/api', dimensionsRoutes)
app.use(notFoundHandler);
app.use(errorHandler);


app.listen(port, ( ) =>  console.log(`Servidor levantado en el puerto ${port}`))