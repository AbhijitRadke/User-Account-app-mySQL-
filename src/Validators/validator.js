
const isEmpty = function (value) {
    if (typeof value === "undefined" || value === null) return false;
    if (typeof value === "string" && value.trim().length === 0) return false;
    return true;
}

const isValidBody = function (object) {
    return Object.keys(object).length > 0;
}

const isValidName = function (name) {
    if (typeof name === "undefined" || name === null) return false;
    if (typeof name === "string" && name.trim().length === 0) return false;
    const nameRegex = /^[a-zA-Z ]+$/;
    return nameRegex.test(name);
}


const isValidPhone = function (num) {
    if (typeof num === "undefined" || num === null) return false;
    if (typeof num === "string" && num.trim().length === 0) return false;
    const reg = /^[0-9]{10}$/;
    return reg.test(num);
}


const isValidEmail = function (email) {
    if (typeof email === "undefined" || email === null) return false;
    if (typeof email === "string" && email.trim().length === 0) return false;
    const emailRegex = /^[a-z0-9][a-z0-9-_\.]+@([a-z]|[a-z0-9]?[a-z0-9-]+[a-z0-9])\.[a-z0-9]{2,10}(?:\.[a-z]{2,10})?$/;
    return emailRegex.test(email);
}

const isValidpincode = function (pincode) {

    const reg = /^[0-9]{6}$/;
    return reg.test(String(pincode));
};



const isValidInstallment = function isInteger(value) {
    if (value < 0) return false
    if (value % 1 == 0) return true;
}




const isVaildPass = function (str) {
    const re = /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,15}$/;
    return re.test(str);
}






module.exports = { isVaildPass, isEmpty, isValidName, isValidEmail, isValidPhone, isValidBody, isValidpincode, isValidInstallment, }


