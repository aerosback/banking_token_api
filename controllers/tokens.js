'use strict'
const Token = require("../models/token");
const {validate_token_creation_fields, sign_in, verify} = require("../utils")

async function createToken(req, res) {
  const {all_fields_valid, error_fields} = validate_token_creation_fields(req)
  if (!all_fields_valid) {
    res.status(400).send({ message: "Invalid Request Fields", error_fields: error_fields});
    return;
  }

  // Create a Token
  let token_model = new Token({
    card_number: req.body.card_number,
    cvv: req.body.cvv,
    expiration_month: req.body.expiration_month,
    expiration_year: req.body.expiration_year,
    email: req.body.email,
    token_value: null,
    business_pk: req.headers["BEARER"]
  });

  const payload = token_model.getPayload()
  const token = sign_in(payload)
  token_model.token_value = token

  try {
    await token_model.save();
    res.send({payload, token});
  }
  catch(err) {
    res.status(500).send({
      message:
        err.message || "Some error occurred while creating the Token."
    });
  }
}

async function getTokenInfo(req, res) {
  const retrieved_token = req.body.token;
  if(!retrieved_token){
    res.status(400).send({ message: "Missing Token Body Parameter" });
    return;
  }
  await Token.findOne({ token_value: retrieved_token })
    .then((object) => {
      if (!object)
        res.status(404).send({ message: `Not found Token with Token Value: ${retrieved_token}` });
      else{
        const payload = object.getPayload()
        const {is_valid, expired} = verify(retrieved_token, payload)
        if(expired)
          res.status(400).send({ message: `Expired Token with Token Value: ${retrieved_token}` });
        else if(!is_valid)
          res.status(401).send({ message: `Invalid Token with Token Value: ${retrieved_token}` });
        else
          res.send(payload);
      }
    })
    .catch(err => {
      res
        .status(500)
        .send({ message: `Error retrieving Token with Token Value: ${retrieved_token} , error: ${err}`});
    });
}

module.exports = {
  createToken, getTokenInfo
}
