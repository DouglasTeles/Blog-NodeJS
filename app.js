//load modules required
const express = require('express')
const handlebars = require('express-handlebars');
const bodyParser = require('body-parser')
const app = express()
const admin = require('./routes/admin')//recebendo o arquivo de rotas admin
const path = require('path')
const mongoose = require('mongoose')
const session = require('express-session')
const flash = require('connect-flash');
const e = require('express');
require ('./models/Postagem')
const Postagem = mongoose.model('postagens')
require('./models/Categoria')
const Categoria = mongoose.model('categorias')
const usuarios = require('./routes/usuario')
const passport = require('passport')
require('./config/auth')(passport)
const db = require("./config/db")

//setup
    //Sessão
    app.use(session({
        secret: 'cursodenode', 
        resave: true,
        saveUninitialized: true
    }))
    //config de Passport
    app.use(passport.initialize())
    app.use(passport.session())

    //flash
    app.use(flash())

    //MiddleWare
    app.use((req, res, next) =>{
        res.locals.success_msg = req.flash("success_msg")
        res.locals.error_msg = req.flash("error_msg")
        res.locals.error = req.flash("error")
        res.locals.user = req.user || null //guarda os dados do usuario logado

        next();
    })
    //body-parser teste
        app.use(bodyParser.urlencoded({ extended:true}))
        app.use(bodyParser.json())
    //handlebars
        app.engine('handlebars', handlebars({defaultLayout:'main'}));
        app.set('view engine', 'handlebars');
    
    //mongoose
    mongoose.Promise = global.Promise    
    mongoose.connect(db.mongoURI).then(() =>{
    console.log("Conectado ao mongo")
    }).catch((erro) =>{
        console.log("Erro ao se conectar:" + erro)
    })

    //Public(static files)
    app.use(express.static(path.join(__dirname, 'public')))//

    //middleware
    // app.use((req, res, next) =>{
    //     console.log("Middleware onn")
    //     next();
    // })

//Rotas
    //importação de routes
app.use('/admin', admin)//setup route for admin in ROUTES/ADMI.JS

app.use('/posts', admin)//setup route for admin in ROUTES/ADMI.JS

app.use('/usuarios', usuarios) //rota de configuração de usuarios




//listando as postagens
app.get('/', (req, res)=>{
    Postagem.find().populate("categoria").lean().sort({data:"desc"}).limit(10).then((postagens)=>{
        res.render('index', {postagens:postagens}) 
    }).catch((err)=>{
        req.flash("error_msg","Houve um erro")
        res.redirect("/404")
    })
        
})

app.get('/404', (req, res)=>{
    console.log(err)
    res.send("Erro 404")
})

//buscando postagem por slug
app.get('/postagem/:slug', (req,res)=>{
    Postagem.findOne({slug:req.params.slug}).lean().then((postagem)=>{
        if(postagem){
            res.render('postagem/index', {postagem: postagem})

        }else{
            req.flash("error_msg","Erro ao buscar post!")
            res.redirect('/')
        }
    }).catch((err)=>{
        console.log(err)
        req.flash("error_msg","Houve um erro interno")
        res.redirect("/")
    })
})

//Rota para listar categoria em navbar
app.get('/categorias', (req, res)=>{
    Categoria.find().lean().then((categorias)=>{
        res.render("categorias/index", {categorias: categorias})
    }).catch((error)=>{
        req.flash("error","Erro ao listar categorias" )
        res.redirect("/")
    })
})

//listando postagem via categorias
app.get('/categorias/:slug', (req, res)=>{
    Categoria.findOne({slug: req.params.slug}).lean().then((categoria)=>{
        if (categoria) {
            Postagem.find({categoria: categoria._id}).lean().then((postagens) =>{
                res.render('categorias/postagens', {postagens: postagens, categoria:categoria})

            }).catch((err)=>{
                req.flash("error_msg","Houve um erro ao listar posts")
                res.redirect("/")
            })


        }else{
            req.flash("error","Esta categoria não existe" )
            res.redirect("/")
        }

    }).catch((err)=>{
        req.flash("error","Erro ao listar postagens relacionadas")
        res.redirect("/")
    })
})



//others
const PORT = process.env.PORT || 8081;
app.listen(PORT, () =>{
    console.log('Servidor rodando')
})