const mongoose = require("mongoose");

const tokenSchema = new mongoose.Schema({
    card_number: String,
    cvv: String,
    expiration_month: String,
    expiration_year: String,
    business_pk: String,
    email: String,
    token_value: {
      type: String,
      unique: true
    }
  },
  { timestamps: true }
);
tokenSchema.method("getPayload", function() {
  const { card_number, expiration_month, expiration_year, email} = this.toObject();
  return { card_number, expiration_month, expiration_year, email};
});
const Token = mongoose.model("Token", tokenSchema);

module.exports = Token;
