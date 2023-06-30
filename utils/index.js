require("dotenv").config();
const jwt = require('jsonwebtoken');
const logger = require("./logger")

module.exports.validate_token_creation_fields = (req) => {
    let all_fields_valid = true
    let error_fields = {}
    const validations = [
        {
            field_name: "headers*business_pk",
            value: req.headers["authorization"],
            regexp: "^Bearer Token [a-zA-Z0-9_]+$"
        },
        {
            field_name: "card_number",
            value: req.body.card_number,
            regexp: "^(\\d){13,16}$"
        },
        {
            field_name: "cvv",
            value: req.body.cvv,
            regexp: "^(\\d){3,4}$"
        },
        {
            field_name: "expiration_month",
            value: req.body.expiration_month,
            regexp: "^(\\d){1,2}$",
            custom_fn: (value) => { const parsed_value = parseInt(value); return parsed_value >= 1 && parsed_value <= 12;}
        },
        {
            field_name: "expiration_year",
            value: req.body.expiration_year,
            regexp: "^(\\d){4}$",
            custom_fn: (value) =>{
                const year = parseInt(value);
                const current_year = new Date().getFullYear();
                return year >= current_year - 5 && year <= current_year + 5;
            }
        },
        {
            field_name: "email",
            value: req.body.email,
            regexp: "^[a-zA-Z][a-zA-Z0-9]+@(gmail\.com|hotmail\.com|yahoo\.es)$"
        }
    ]

    for(let index = 0; index < validations.length; ++index){
        const entry = validations[index];
        const regexp = new RegExp(entry.regexp);
        if(!entry.value){
            if(!error_fields.hasOwnProperty(entry.field_name)){
                error_fields[entry.field_name] = []
            }
            error_fields[entry.field_name].push("empty field");
            all_fields_valid = false;
        }
        if(entry.value && !regexp.test(entry.value)){
            if(!error_fields.hasOwnProperty(entry.field_name)){
                error_fields[entry.field_name] = []
            }
            error_fields[entry.field_name].push("format error");
            all_fields_valid = false;
        }
        if(entry.value && entry.hasOwnProperty("custom_fn") && !entry.custom_fn(entry.value)){
            if(!error_fields.hasOwnProperty(entry.field_name)){
                error_fields[entry.field_name] = []
            }
            error_fields[entry.field_name].push("invalid value");
            all_fields_valid = false;
        }
    }
    return {all_fields_valid, error_fields};
};

function normalize_payload(payload){
    const valid_keys = ["card_number", "expiration_month", "expiration_year", "email"]
    const normalized_payload = Object.keys(payload)
    .sort()
    .reduce((accumulator, key) => {
        if(valid_keys.includes(key))
            accumulator[key] = payload[key];
      return accumulator;
    }, {});
    return normalized_payload;
}

module.exports.sign_in = (payload) => {
    const SIGN_IN_SECRET = process.env.SIGN_IN_SECRET
    let token = ""
    const normalized_payload = normalize_payload(payload)
    const expiration_mins = Math.floor(process.env.SIGN_IN_EXPIRATION_SECS / 60)
    logger.debug(`-------> expiration_mins: ${expiration_mins}.`);
    try{
        token = jwt.sign(
            normalized_payload,
            SIGN_IN_SECRET,
            { expiresIn: `${expiration_mins}m` }
        );
    }
    catch(err){
        logger.error(`Error occurred: ${err}.`);
    }
    return token;
};


module.exports.verify = (token, payload) => {
    const SIGN_IN_SECRET = process.env.SIGN_IN_SECRET
    let decoded_payload = {}
    let [is_valid, expired] = [true, false]
    const normalized_payload = normalize_payload(payload)
    try{
        decoded_payload = jwt.verify(token, SIGN_IN_SECRET);
        decoded_payload = normalize_payload(decoded_payload)
    }
    catch(err){
        is_valid = false
        if (err instanceof jwt.TokenExpiredError) {
            expired = true;
            logger.error(`JWT Token Expired Error occurred: ${err}.`);
        }
        return {is_valid, expired}
    }
    is_valid = JSON.stringify(normalized_payload) === JSON.stringify(decoded_payload)
    return {is_valid, expired}
};