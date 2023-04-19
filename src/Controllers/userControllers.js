
const jwt = require("jsonwebtoken")
const bcrypt = require('bcrypt')
const validator = require("../Validators/validator")
const mysql = require('mysql')
require('dotenv').config();


const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE
});



const { isValidName, isValidEmail, isValidPhone, isValidBody, isValidpincode, isVaildPass } = validator


const userCreate = async function (req, res) {
    try {

        let data = req.body
        let { fname, lname, email, phone, password, address, pincode } = data

        if (!fname) return res.status(400).send({ status: false, message: "fname is required" })
        if (!isValidName(fname.trim())) return res.status(400).send({ status: false, message: `${fname} is not a valid first name.` })

        if (!lname) return res.status(400).send({ status: false, message: "lname is required" })
        if (!isValidName(lname.trim())) return res.status(400).send({ status: false, message: `${lname} is not a valid last name.` })


        if (!email) return res.status(400).send({ status: false, message: "email is required" })
        if (!isValidEmail(email.trim())) return res.status(400).send({ status: false, message: `${email} is not a valid email.` })

        const findEmail = `SELECT email FROM users WHERE email = '${email}'`;
        let checkEmail = await new Promise((resolve, reject) => {
            db.query(findEmail, (err, result) => {
                if (err) reject(err);
                resolve({ ...result[0] });
            });
        });
        if (checkEmail.email) { return res.status(409).send({ status: false, message: `${email} is already in use, Please try a new Email.` }) }


        if (!phone) return res.status(400).send({ status: false, message: "phone is required" })
        if (!isValidPhone(phone)) return res.status(400).send({ status: false, message: `${phone} is not a valid phone.` })

        const findPhone = `SELECT phone FROM users WHERE phone = '${phone}'`;
        let cheakPhone = await new Promise((resolve, reject) => {
            db.query(findPhone, (err, result) => {
                if (err) reject(err);
                resolve({ ...result[0] });
            });
        });
        if (cheakPhone.phone) { return res.status(409).send({ status: false, message: `${phone} is already in use, Please try a new phone number.` }) }

        if (!password) return res.status(400).send({ status: false, message: "password is required" })
        if (!isVaildPass(password.trim())) return res.status(400).send({ status: false, message: "Please provide a valid Password with min 8 to 15 char with Capital & special (@#$%^!) char " })



        if (!address) return res.status(400).send({ status: false, message: "address is required" })
        if (!(pincode)) return res.status(400).send({ status: false, message: "pincode Required" })
        if (!isValidpincode(pincode)) return res.status(400).send({ status: false, message: "Pincode is not valid" })




        const encryptedPassword = await bcrypt.hash(password, 10) //encrypting password by using bcrypt. // 10 => salt sound

        //object destructuring for response body.


        const Insert = `INSERT INTO users (fname, lname, email, phone, password, address, pincode) 
               VALUES ('${fname}', '${lname}', '${email}', '${phone}', '${encryptedPassword}', '${address}', '${pincode}')`;
        db.query(Insert, (err, result) => {
            if (err) throw err;
            return res.status(201).send({ status: true, message: "Success", data: result });
        });


    } catch (error) {
        res.status(500).send({ status: false, message: error.message })
    }
}




const userLogin = async function (req, res) {
    try {
        let userdata = req.body;

        if (!isValidBody(userdata))
            return res.status(400).send({ status: false, message: "Please provide user credentials !!!" });
        let { email, password } = userdata;

        if (!email)
            return res.status(400).send({ status: false, message: "Email is required" });
        if (!isValidEmail(email.trim()))
            return res.status(400).send({ status: false, message: `This is not a valid email.` });

        if (!password)
            return res.status(400).send({ status: false, message: "Password is required" });

        const findEmail = `SELECT * FROM users WHERE email = '${email}'`;
        let checkEmail = await new Promise((resolve, reject) => {
            db.query(findEmail, (err, result) => {
                if (err) reject(err);
                if (result.length === 0)
                    return res.status(404).send({
                        status: false,
                        message: "This user is not found Please provide a correct Email",
                    });

                resolve({ ...result[0] });
            });
        });

        // console.log(checkEmail)

        let checkPassword = await bcrypt.compare(password, checkEmail.password); // mostly password used:- Abjhd@123/Pass@123
        if (!checkPassword)
            return res.status(400).send({ status: false, message: "Your password is wrong, Please enter correct password", });

        let userId = checkEmail.id;
        let userToken = jwt.sign({ userId: userId.toString() },
            "ABHIJIT",
            { expiresIn: "24h" }
        );
        res.setHeader("x-api-key", userToken);

        res.status(200).send({ status: true, message: "Success", userId: userId, userToken });
    } catch (err) {
        res.status(500).send({ status: false, message: err.message });
    }
};


//-------------------get user---------------------------------

const userById = async function (req, res) {

    try {

        const userId = req.params.Id

        const findUser = `SELECT * FROM users WHERE id = '${userId}'`;
        let userDetails = await new Promise((resolve, reject) => {
            db.query(findUser, (err, result) => {
                if (err) reject(err)

                if (result.length === 0)
                    return res.status(404).send({ status: false, message: "This user is not found Please provide a correct Id", });
                resolve({ ...result[0] })
            })
        });

        if (userDetails.isDeleted) return res.status(400).send({ status: false, message: "User Is Deleated" })

        return res.status(200).send({ status: true, message: "Success", data: userDetails })

    } catch (error) {
        return res.status(500).send({ status: false, message: error.message })

    }
}

const allUsers = async function (req, res) {

    try {

        const findUser = `SELECT * FROM users WHERE isDeleted = 0`;
        let userDetails = await new Promise((resolve, reject) => {
            db.query(findUser, (err, result) => {
                if (err) reject(err)

                if (result.length === 0)
                    return res.status(404).send({ status: false, message: "This user is not found Please provide a correct Id", });
                resolve({ ...result })
            })
        });

        if (userDetails.length === 0) return res.status(404).send({ status: false, message: "Users not found" })

        return res.status(200).send({ status: true, message: "Success", data: userDetails })

    } catch (error) {
        return res.status(500).send({ status: false, message: error.message })

    }
}



const updateUser = async function (req, res) {
    try {
        let userId = req.params.Id;
        const data = req.body;

        if (!isValidBody(data) && (typeof (files) == "undefined")) return res.status(400).send({ status: false, message: "Insert Data : BAD REQUEST" });

        let { fname, lname, email, phone, password, address, pincode } = data;

        let updateUserQuery = `UPDATE users SET`;

        if (fname) {
            if (!isValidName(fname.trim())) return res.status(400).send({ status: false, message: "First name is invalide" })
            updateUserQuery += ` fname = '${fname}',`;

        }

        if (lname) {
            if (!isValidName(lname.trim())) return res.status(400).send({ status: false, message: "Last Name is invalide" });
            updateUserQuery += ` lname = '${lname}',`;

        }

        if (email) {
            if (!isValidEmail(email.trim())) return res.status(400).send({ status: false, message: "Provide a valid email id" });
            const findEmail = `SELECT email FROM users WHERE email = '${email}'`;
            let checkEmail = await new Promise((resolve, reject) => {
                db.query(findEmail, (err, result) => {
                    if (err) reject(err);
                    resolve({ ...result[0] });
                });
            });
            if (checkEmail.email) { return res.status(409).send({ status: false, message: `${email} is already in use, Please try a new Email.` }) }

            updateUserQuery += ` email = '${email}',`
        }

        if (phone) {
            if (!isValidPhone(phone)) return res.status(400).send({ status: false, message: "Invalid phone number" });
            const findPhone = `SELECT phone FROM users WHERE phone = '${phone}'`;
            let cheakPhone = await new Promise((resolve, reject) => {
                db.query(findPhone, (err, result) => {
                    if (err) reject(err);
                    resolve({ ...result[0] });
                });
            });
            if (cheakPhone.phone) { return res.status(409).send({ status: false, message: `${phone} is already in use, Please try a new phone number.` }) }

            updateUserQuery += ` phone = '${phone}',`;

        }

        if (password) {
            if (!isVaildPass(password.trim())) return res.status(400).send({ status: false, message: "Password should be Valid min 8 character and max 15 " })
            const hashedPassword = await bcrypt.hash(password, 10)
            updateUserQuery += ` password = '${hashedPassword}',`
        }

        if (address) {
            updateUserQuery += ` address = '${address}',`

        }
        if (pincode) {
            if (!isValidpincode(pincode)) return res.status(400).send({ status: false, message: "Pinecode is not valide" })
            updateUserQuery += ` pincode = '${pincode}',`

        }

        // Remove trailing comma if necessary
        if (updateUserQuery.endsWith(",")) {
            updateUserQuery = updateUserQuery.slice(0, -1);
        }

        updateUserQuery += ` WHERE id = '${userId}'`;


        db.query(updateUserQuery, (err, result) => {
            if (err) throw err


            if (result.affectedRows === 0) {
                return res.status(404).send({ status: false, message: "User not found" });
            }

            res.status(200).send({ status: true, message: "User updated successfully" });
        });
    } catch (err) {
        return res.status(500).send({ status: false, message: err.message });
    }
}

// -==========================Delete User==========================

const deleteUserById = async function (req, res) {
    try {

        const userId = req.params.Id

        const findUser = `SELECT * FROM users WHERE id = '${userId}'`;
        let userDetails = await new Promise((resolve, reject) => {
            db.query(findUser, (err, result) => {
                if (err) reject(err)

                if (result.length === 0)
                    return res.status(404).send({ status: false, message: "This user is not found Please provide a correct Id", });
                resolve({ ...result[0] })
            })
        });


        if (userDetails.isDeleted) return res.status(404).send({ status: false, message: "User not found (already deleted)" })
        const deleteUserQuery = `UPDATE users SET isDeleted = 1 WHERE id =${userId}`
        db.query(deleteUserQuery, (err, result) => {
            if (err) throw err


            if (result.affectedRows === 0) {
                return res.status(404).send({ status: false, message: "User not found" });
            }

            return res.status(200).send({ status: true, message: "User deleted successfully" });
        });

    } catch (err) {
        res.status(500).send({ status: false, message: err.message })
    }

}

module.exports = { userLogin, userById, userCreate, updateUser, allUsers, deleteUserById, db }
