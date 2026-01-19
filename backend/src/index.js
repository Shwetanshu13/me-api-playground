import 'dotenv/config';
import express from 'express';
import apiRouter from './routes/api.js';

const app = express();
app.use(express.json());

app.use('/', apiRouter);

app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
});

const port = process.env.PORT || 3001;
app.listen(port, () => {
    console.log(`API server listening on port ${port}`);
});
