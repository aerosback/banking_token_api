const mongoose = require('mongoose');
const Token = require('../../models/token');
const tokenData = {
    card_number: "103456789123400",
    cvv: "120",
    expiration_month: "10",
    expiration_year: "2023",
    email: "demo244@gmail.com",
    token_value: "abcdefghijklmnoprstuvwxyz"
};

describe('Test Token model', () => {
    beforeAll(async () => {
        await mongoose.connect(global.__MONGO_URI__, { useNewUrlParser: true, useCreateIndex: true }, (err) => {
            if (err) {
                console.error(err);
                process.exit(1);
            }
        });
    });

    beforeEach(async () => {
        await Token.deleteMany({});
    });

    it('create & save Token successfully', async () => {
        const validToken = new Token(tokenData);
        const savedToken = await validToken.save();
        expect(savedToken._id).toBeDefined();
        expect(savedToken.email).toBe(tokenData.email);
    });

    it('insert Token successfully, but the undefined fields in schema should be undefined', async () => {
        const tokenWithInvalidField = new Token({ card_number: "103456789123401",  cvv: "120", token_value: "abcdefghijklmnopq12345"});
        const savedTokenWithInvalidField = await tokenWithInvalidField.save();
        expect(savedTokenWithInvalidField._id).toBeDefined();
        expect(savedTokenWithInvalidField.email).toBeUndefined();
    });
})