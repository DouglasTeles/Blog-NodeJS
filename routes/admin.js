const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
require("../models/Categoria")//carrega o arquivo que define as informações do model(banco)
const Categoria = mongoose.model('categorias')
require('../models/Postagem')
const Postagem = mongoose.model('postagens')
const {eAdmin} = require('../helpers/eAdmin')


router.get('/', eAdmin, (req, res) =>{
    res.render("admin/index")
})

router.get('/posts', eAdmin, (req, res) =>{
    res.send("Pagina de posts")
})

//busca de categoria no banco
router.get('/categorias', eAdmin, (req, res) =>{
    Categoria.find().lean().sort({date:"desc"}).then((categorias)=>{ //listando dados do banco no formulario
        res.render("admin/categorias", {categorias : categorias})
    }).catch((error)=>{
        req.flash("error.message", "houve um erro ao listar categorias!")
        res.redirect("/admin")
    })
    
})
router.get('/categorias/add', eAdmin,(req, res)=>{//formulario para cadastro de categorias
    res.render("admin/addcategoria")
})

//responsavel por cadastrar categoria no banco
router.post('/categorias/nova', eAdmin, (req, res) =>{
    
    var erros = [];
    //Se campo vazio  ou   tipo do campo for undefined     ou campo nulo  
    if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null){
        erros.push({texto: "Nome inválido"})
    }
    if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null){
        erros.push({texto: "Slug inválido"})
    }
    if(erros.length > 0){
        res.render("admin/addcategoria", {erros: erros})
    }
    else{
        const novaCategoria = {
            nome:req.body.nome,//pegando informação do fomulario com o name nome
            slug: req.body.slug //pegando informação do fomulario com o name slug
        }
    
        new Categoria(novaCategoria).save().then(() =>{
        req.flash('success_msg', 'Categoria cadastrada com sucesso')
        res.redirect('/admin/categorias')
        }).catch((err) =>{
            req.flash('erro_msg', 'Houve um erro ao salvar')
            res.redirect("/admin")
        })  
    }
    
})

//Lista a categoria dentro do input
router.get('/categorias/edit/:id', eAdmin, (req, res) =>{
    Categoria.findOne({_id:req.params.id}).lean().then((categoria)=>{
        res.render("admin/editcategoria", {categoria:categoria})
    }).catch((err) =>{
        req.flash("error_msg","Categoria não encontrada")
        res.redirect("/admin/categorias")
    })
    
})
//aplica a edição na categoria
router.post('/categorias/edit', eAdmin, (req, res) =>{
    Categoria.findOne({_id: req.body.id}).then((categoria)=>{
        categoria.nome = req.body.nome
        categoria.slug = req.body.slug

        categoria.save().then(()=>{
            req.flash("success_msg", "Categoria Editada com sucesso!")
            res.redirect("/admin/categorias")
        }).catch((err)=>{
            req.flash("error_msg","Houve um erro ao salvar a edição!")
            res.redirect("/admin/categorias")
        })

    }).catch((err)=>{
        req.flash("error_msg", "Houve um erro ao editar categoria")
        res.redirect("/admin/categorias")
    })
})

//Deletar Categoria
router.post('/categorias/deletar', eAdmin, (req, res) => {
    Categoria.remove({_id: req.body.id}).then(() =>{
        req.flash("success_msg", {_nome: req.body.nome}, "deletada com sucesso")
        
        res.redirect("/admin/categorias").catch((err) => {
            req.flash("error_msg", "Houve um erro ao deletar categoria")
            res.redirect("/admin/categorias")
        })
    })
})

//Postagems
router.get("/postagens", eAdmin, (req, res) => {
    Postagem.find().lean().populate("categoria").sort({data: "desc"}).then((postagens)=>{
        res.render("admin/postagens", {postagens : postagens})
    }).catch((error)=>{
        req.flash("error.message", "houve um erro ao listar Postagens!")
        res.redirect("/admin")
    })
})

router.get('/postagens/add', eAdmin, (req, res) => { // rota para listagem das categorias disponiveis
    Categoria.find().lean().then((categorias)=>{//enviando as categorias para o formulario
        res.render("admin/addpostagem", {categorias:categorias})
    }).catch((err)=>{
        req.flash("error_msg", "Houve um erro ao carregar o formulario")
        res.redirect("/admin")
    })
    
})

router.post('/postagens/nova', eAdmin, (req, res)=>{ //Rota para recebimento dos dados do formulario
    //verificação de preenchimento
    var erros = [];
    if (req.body.categoria == 0) {
        erros.push({texto: "Categoria inválida, selecione uma categoria"})
    }
    if (erros.length > 0) {
        res.render("admin/addpostagem", {erros:erros})
    }else{
        const NovaPostagem = {
            titulo: req.body.titulo,
            slug: req.body.slug,
            descricao: req.body.descricao,
            conteudo: req.body.conteudo,
            categoria: req.body.categoria
        }
        new Postagem(NovaPostagem).save().then(() =>{
            req.flash("success_msg", "Postagem feita com sucesso")
            res.redirect("/admin/postagens")
        }).catch((err)=>{
            req.flash("error_msg", "Erro ao cadastrar postagem")
            req.redirect("/admin/postagens")
        })
    }

})
//Editar Postagens
//listando as postagens dentro dos inputs
router.get('/postagens/edit/:id', eAdmin, (req, res) =>{
    Postagem.findOne({_id:req.params.id}).lean().then((postagem)=>{
        Categoria.find().lean().then((categorias)=>{
        res.render('admin/editpostagem', {categorias:categorias, postagem:postagem})
        }).catch((err)=>{
            req.flash("error_msg","Houve um erro ao listar categorias")
            res.redirect("/admin/postagens")
        })  
        
        
    
    }).catch((err) =>{
        req.flash("error_msg","Categoria não encontrada")
        res.redirect("/admin/postagem")
    })
    
})

//recebimento dos dados e atualização no banco
router.post('/postagem/edit', eAdmin, (req, res)=>{
    Postagem.findOne({_id:req.body.id}).then((postagem)=>{
        postagem.titulo = req.body.titulo
        postagem.slug = req.body.slug
        postagem.descricao = req.body.descricao
        postagem.conteudo = req.body.conteudo
        postagem.categoria = req.body.categoria

        postagem.save().then(()=>{
            req.flash("success_msg", "Postagem atualizada com sucesso")
            res.redirect('/admin/postagens')

        }).catch((err)=>{
            req.flash("error_msg", "Erro ao atualizar postagem")
            res.redirect("/admin/postagens")
        })
    }).catch((err)=>{
        console.log(err)
        req.flash("erro_msg", "Houve um erro ao  salvar a edição")
        res.redirect("/admin/postagens")
    })
})

//Deletar postagem
router.get('/postagens/deletar/:id', eAdmin, (req, res)=>{
    Postagem.remove({_id: req.params.id}).then(()=>{
        req.flash("success_msg","Postagem deletada")
        res.redirect('/admin/postagens')
    }).catch((err)=>{
        req.flash("error_msg", "Erro ao deletar")
    })
})



module.exports = router