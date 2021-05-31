const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const Categoria = new Schema({
    nome: {
        type: 'string', required: true
    },
    slug: {
        type: 'string', required: true
    },
    date: {
        type: 'date', default: Date.now()
    }
})

mongoose.model("categorias", Categoria)