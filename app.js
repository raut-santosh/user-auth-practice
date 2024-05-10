const express = require('express');
const session = require('express-session');
const path = require('path')
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const app = express();

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: false
}));

app.set('views', path.join(__dirname, 'views'))

app.get('/', (req, res) => {
    res.redirect('/user');
});

app.get('/login', (req, res) => {
    res.render('login')
})


app.get('/admin',async (req, res) => {
    res.render('admin', { username: req.session.username });
});


app.get('/user', (req, res) => {
    res.render('user')
})

app.get('/create-user', (req, res) => {
    res.render('admin/create-user')
})


app.get('/assistant', (req, res) => {
    res.render('assistant', { username: req.session.username });
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});