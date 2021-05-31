if (process.env.NODE_ENV == "production") {
    module.exports = {mongoURI: "mongodb+srv://douglas:admin123@cluster0.ipwbz.mongodb.net/blogapp"}
}else{
    module.exports = {mongoURI: "mongodb://localhost/blogapp"}
}