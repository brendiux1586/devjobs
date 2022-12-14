const mongoose = require('mongoose');
require('./config/db');

const express = require('express');
const { create } = require('express-handlebars');
const router = require('./routes');
const path = require('path');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const flash = require('connect-flash');
const createError = require('http-errors');
const passport = require('./config/passport');
const { isNull } = require('util');


require('dotenv').config({path:'variables.env'})

const app = express();

// habilitar body-parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

//Validacion de campos con express validator
app.use(expressValidator());

const hbs = create({
    helpers: require('./helpers/handlebars')
});

app.engine('handlebars',hbs.engine);
app.set('view engine','handlebars');
app.set('views','./views');

// const hbs = create({
//     layoutsDir: path.join(__dirname,'/views/layouts'),
//     extname: 'hbs',
//     defaultLayout: 'main'
// });

// app.engine('hbs',hbs.engine);
// //Habilitar handlebars como view
// // app.engine('handlebars', 
// //     exphbs({
// //         defaultLayout: 'layout'
// //     })
// // );

// app.set('view engine','hbs');

//Archivos estaticos
app.use(express.static(path.join(__dirname,'public')));
app.use(cookieParser());
app.use(session({
    secret: process.env.SECRETO,
    key: process.env.KEY,
    resave:false,
    saveUninitialized: false,
    store: MongoStore.create({mongoUrl: process.env.DATABASE})

}));

//Inicializar passport
app.use(passport.initialize());
app.use(passport.session());

//Alertas y flash messages
app.use(flash());

//Crear nuestro middleware
app.use((req, res, next) => {
    res.locals.mensajes = req.flash();
    next();
});


app.use('/',router());

//404 pagina no existente
app.use((req, res, next) => {
    next(createError(404, 'No encontrado'));
})

//Administracion de errores
app.use((error, req, res,next) => {
    res.locals.mensaje = error.message;
    const status = error.status || 500; //Si el error no existe se devuelve 500
    res.locals.status = status;
    res.status(status);
    res.render('error');
});

//Dejar que heroku asigne el puerto
const host= '0.0.0.0';
const port = process.env.PORT || 3000;

app.listen(port, host, ()=>{
    console.log('El servidor esta funcionando');
});

