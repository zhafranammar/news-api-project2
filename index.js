const express = require('express');
const app = express();
const port = 3000;
const router = require('./router');

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());


// Gunakan router
app.use('/', router);

app.listen(port, () => {
  console.log(`App running on port ${port}`);
});
