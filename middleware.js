module.exports.isLoggedIn = (req, res, next) => {
    if(!req.isAuthenticated()) {
        req.flash("error", "You must loggged in to create student");
        return res.redirect("/login");
    }
}