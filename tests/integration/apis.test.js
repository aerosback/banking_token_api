const app = require('../../app');
const supertest = require('supertest');
const request = supertest(app);
const mongoose = require('mongoose');
const {sign_in} = require("../../utils");
const Token = require('../../models/token');
const tokenData = {
    card_number: "103456789123400",
    cvv: "120",
    expiration_month: "10",
    expiration_year: "2023",
    email: "demo244@gmail.com",
};

function getErrorFieldsFromMissingKeys(payload, requiredKeys){
    const payloadKeys = Object.keys(payload);
    return requiredKeys
    .reduce((accumulator, key) => {
        if(!payloadKeys.includes(key))
            accumulator[key] = ["empty field"];
      return accumulator;
    }, {});
}

describe('API Entry points testsuite', () => {

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


    it('Base Case: Create and Get Info', async () => {

        const expectedPayload = {
            card_number: "103456789123400",
            expiration_month: "10",
            expiration_year: "2023",
            email: "demo244@gmail.com",
        };

        const token = sign_in(expectedPayload)

        const response = await request
            .post('/api/tokens/create')
            .set('Authorization', 'Bearer Token abc123')
            .send(tokenData);
        
        expect(response.status).toBe(200);
        expect(response.body.token).toBe(token);
        expect(response.body.payload).toEqual(expectedPayload);

        const next_response = await request
            .post('/api/tokens/info')
            .send({token: token});
        expect(next_response.status).toBe(200);
        expect(next_response.body).toEqual(expectedPayload);       

    });


    it('Create Token with Empty Required Fields', async () => {

        const requiredFields = ["card_number", "cvv", "expiration_month", "expiration_year", "email"]
        const currentPayload = {
            card_number: "103456789123400",
            expiration_month: "10",
        };
        const error_fields = getErrorFieldsFromMissingKeys(currentPayload, requiredFields);
        const response = await request
            .post('/api/tokens/create')
            .set('Authorization', 'Bearer Token def123')
            .send(currentPayload);
        
        expect(response.status).toBe(400);
        expect(response.body).toEqual({ message: "Invalid Request Fields", error_fields: error_fields});    

    });

    it('Create Token with Wrong Format Required Fields', async () => {

        const currentPayload = {
            card_number: "10", //invalid card length
            expiration_month: "2",
            expiration_year: "2023",
            email: "demo244@guerrillamail.com", //invalid email
            cvv: "1234"
        };
        const error_fields = {
            card_number: ["format error"],
            email: ["format error"]
        }
        const response = await request
            .post('/api/tokens/create')
            .set('Authorization', 'Bearer Token def143')
            .send(currentPayload);
        
        expect(response.status).toBe(400);
        expect(response.body).toEqual({ message: "Invalid Request Fields", error_fields: error_fields});    

    });

    it('Create Token with Invalid Required Fields', async () => {

        const currentPayload = {
            card_number: "103456789123400",
            expiration_month: "22",   //invalid month
            expiration_year: "2093", //invalid year
            email: "demo244@gmail.com",
            cvv: "1234"
        };
        const error_fields = {
            expiration_year: ["invalid value"],
            expiration_month: ["invalid value"]
        }
        const response = await request
            .post('/api/tokens/create')
            .set('Authorization', 'Bearer Token def143')
            .send(currentPayload);
        
        expect(response.status).toBe(400);
        expect(response.body).toEqual({ message: "Invalid Request Fields", error_fields: error_fields});    

    });

    it('Create Token with Missing Header', async () => {

        const currentPayload = {
            card_number: "103456789123400",
            cvv: "120",
            expiration_month: "10",
            expiration_year: "2023",
            email: "demo244@gmail.com",
        };
        const error_fields = {
            "headers*business_pk": ["empty field"]
        }
        const response = await request
            .post('/api/tokens/create')
            .send(currentPayload);
        
        expect(response.status).toBe(400);
        expect(response.body).toEqual({ message: "Invalid Request Fields", error_fields: error_fields});    

    });

    it('Get Info: Missing Body Parameter', async () => {
        const response = await request
            .post('/api/tokens/info')
            .send({});
        expect(response.status).toBe(400);
        expect(response.body).toEqual({ message: "Missing Token Body Parameter" });       

    });

    it('Get Info: Non Existent Token', async () => {
        const token = 'token_12345678';
        const response = await request
            .post('/api/tokens/info')
            .send({token: token});
        expect(response.status).toBe(404);
        expect(response.body).toEqual({ message: `Not found Token with Token Value: ${token}` });       

    });

});