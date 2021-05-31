const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Postagem = new Schema({ //campos do modell
    titulo:{
        type: 'String', 
        required: true
    },
    slug: {
        type: 'String',
        require: true
    },
    descricao: {
        type: 'String',
        require: true,
    
    },
    conteudo: {
        type: 'String',
        require: true
    },
    //relacionamento
    categoria: {
        type: Schema.Types.ObjectId,
        ref: "categorias",
        require: true
    },
    data:{
        type: 'date', 
        default: Date.now()
    }
})

mongoose.model("postagens", Postagem)