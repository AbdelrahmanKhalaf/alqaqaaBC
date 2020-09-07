
module.exports = (req, res, next) => {
    //403 is forbideen
    if (!req.user.actvition) 
        return res.status(403).send('Accsess denied');
        next();
}