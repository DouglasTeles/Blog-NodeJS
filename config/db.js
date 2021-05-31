if (process.env.NODE_ENV == "production") {
    module.exports = {mongoURI: "mongodb://douglas:admin123@cluster0.ipwbz.mongodb.net/test"}
}else{
    module.exports = {mongoURI: "mongodb://localhost/blogapp"}
}