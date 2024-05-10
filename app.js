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


function requireLogin(allowedRoles) {
    return async function(req, res, next) {
      if (req.session && req.session.userId) {
        const user = await prisma.users.findUnique({
          where: {
            id: req.session.userId
          }
        });
        if (!user || !allowedRoles.includes(user.role)) {
          return res.redirect('/login');
        }
        req.user = user;
        next();
      } else {
        return res.redirect('/login');
      }
    };
  }
  
  



app.get('/', (req, res) => {
    res.redirect('/admin');
});

app.get('/login', async (req, res) => {
    res.render('login')
})

app.post('/login', async (req, res) => {
    const user = await prisma.users.findUnique({
        where: {
          email: req.body.email,
        },
      })
    if(user.password === req.body.password){
        req.session.userId = user.id;
        res.redirect('/'); 
    }else{
        res.redirect('login')
    }
})

app.get('/logout', (req,res) => {
    req.session.destroy((err) => {
        if (err) {
          return res.redirect('/'); // Handle error
        }
        res.redirect('/login'); // Redirect to the login page after successful logout
      });
})


app.get('/admin', requireLogin(['admin']), async (req, res) => {
    const users = await prisma.users.findMany();
    console.log(users)
    res.render('admin', { users });
});


app.get('/user', requireLogin(['admin', 'user']), (req, res) => {
    res.render('user')
})

app.get('/create-user', requireLogin(['admin','user']), (req, res) => {
    const user = {name: '', email: '', role: '', password: ''}
    res.render('admin/create-user', {user} )
})

app.post('/create-user', requireLogin(['admin','user']), async (req, res) => {
    const user = await prisma.users.create({
        data: {
          email: req.body.email,
          name: req.body.name,
          role: req.body.role,
          password: req.body.password
        },
    })
    res.render('admin/edit-user', user)
})

app.get('/edit-user/:id',  requireLogin(['admin','user']), async (req, res) =>{
    const user = await prisma.users.findUnique({
        where: {
          id: Number(req.params.id),
        },
      })
    console.log(user)
    res.render('admin/edit-user', {user})
})

app.post('/edit-user/:id', requireLogin(['admin','user']), async (req, res) => {
    const user = await prisma.users.update({
        where: {
          id: Number(req.params.id),
        },
        data: {
            name: req.body.name,
            role: req.body.role,
            email: req.body.email,
            password: req.body.password
        },
      })
      console.log(user)
      res.redirect(`/edit-user/${user.id}`)

})


app.get('/assistant',requireLogin(['admin','assistant']), (req, res) => {
    res.render('assistant', { username: req.session.username });
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});