const jwt = require('jsonwebtoken')

const {db} = require('../Controllers/userControllers')



const authentication = function (req, res, next) {
    try {
        let token = req.headers["x-api-key"];
        if (!token) return res.status(400).send({ status: false, msg: "token must be present in header" })

        jwt.verify(token, 'ABHIJIT', function (err, decodedToken) {
            if (err) return res.status(401).send({ status: false, msg: "invalid Token " })

            req.decodedToken = decodedToken
            next()
        })
    } catch (err) {
        return res.status(500).send({ msg: err.message })
    }
}

//----------------Authorization------------------//

const authorization = async function (req, res, next) {
    try {
        let userLoggedIn = req.decodedToken;
        console.log(userLoggedIn)
        let userId = req.params.Id;

        const findUser = `SELECT * FROM users WHERE id = '${userId}'`;

        let userData = await new Promise((resolve, reject) => {
            db.query(findUser, (err, result) => {
                if (err) reject(err)

                if (result.length === 0)
                    return res.status(404).send({ status: false, message: "This user is not found Please provide a correct Id", });
                resolve({ ...result[0] })
            })
        });
        if (!userData) return res.status(404).send({ status: false, msg: "user not Found in Database" })
        if (userData.isDeleted) return res.status(400).send({ status: false, msg: "user is allrady deleated form Database" })

        // console.log(userId)
        if (userId !== userLoggedIn.userId) return res.status(403).send({ status: false, msg: "User is not authorized" });

        next();

    } catch (err) {
        res.status(500).send({ status: false, error: err.message });
    }
};

module.exports = { authentication, authorization };
