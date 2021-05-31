module.exports = {
    eAdmin: function(req, res, next) {
        if (req.isAuthenticated()&& req.use.admin == 1) {
            return next();
        }

        req.flash("error_msg","Você não é um Admin!",  "faça o login para entrar")
        res.redirect("/")
    }
}   