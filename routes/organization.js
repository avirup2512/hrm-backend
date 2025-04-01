
const express = require('express');
const jwt = require("jsonwebtoken");
const mysql = require('mysql');
const connection = require("../class/sql/mysqlDbConnection");
var router = express.Router();
var error = require('../class/error');
var organizationController = require("../controller/organization");
var userController = require("../controller/user");
var response = require("../class/response");
let con = new connection(mysql);
let connectionObject = con.getConnection();
con.connect(connectionObject);
var oController = new organizationController(con, connectionObject,new userController(con,connectionObject));

  /** POST Methods */
    /**
     * @openapi
     * '/organization/create':
     *  post:
     *     tags:
     *     - Organization Controller
     *     summary: Create a new Organization
     *     security:
     *          bearerAuth: [read]
     *     requestBody:
     *      required: true
     *      content:
     *        application/json:
     *           schema:
     *            type: object
     *            required:
     *              - name
     *              - description
     *              - country
     *              - state
     *              - city
     *              - country_state
     *              - state_city
     *            properties:
     *              name:
     *                type: string
     *                default: john
     *              description:
     *                type: string
     *                default: doe
     *              country:
     *                type: array
     *                default: ["India"]
     *              state:
     *                type: array
     *                default: ["Delhi"]
     *              city:
     *                type: array
     *                default: ["Anad vihar"]
     *              country_state:
     *                type: array
     *                default: [[0]]
     *              state_city:
     *                type: array
     *                default: [[0]]
     *     responses:
     *      201:
     *        description: Created
     *      409:
     *        description: Conflict
     *      404:
     *        description: Not Found
     *      500:
     *        description: Server Error
     */
router.post('/create', async function (req, res) {
    let resp = new response();
    let { name, description, country,state,city,country_state,state_city, department} = req.body;
    if (!name || !country || !state || !city || !country_state || !state_city)
        {
            res.status(400)
            .send(new error("Send Proper data."));
    } else {
        for (var x = 0; x < country_state.length; x++)
        {
            if(country_state[x].length == 0)
            {
                res.status(400)
                .send(new error("Send Proper state"));
                break;
            }
        }
        for (var x = 0; x < state_city.length; x++)
        {
            if(state_city[x].length == 0)
            {
                res.status(400)
                .send(new error("Send Proper city"));
                break;
            }
        }
        try {
            var result = await oController.create(req.body);
            console.log(result);
            if (result.hasOwnProperty("status") && result.status !== 200)
            {
                resp.message = result.message;
                res.status(400)
                .send(resp)
            } else {
                resp.message = "Organization is created Successfully";
                resp.data =result[result.length-1].org_id
                res.status(200)
                .send(resp)
            }
            
        } catch (error) {
            console.log(error);
            
            res.status(400)
            .send(error);
        }
        
    }
    
})
  /** POST Methods */
    /**
     * @openapi
     * '/organization/edit':
     *  put:
     *     tags:
     *     - Organization Controller
     *     summary: Edit an Organization
     *     security:
     *          bearerAuth: [read]
     *     requestBody:
     *      required: true
     *      content:
     *        application/json:
     *           schema:
     *            type: object
     *            required:
     *              - name
     *              - description
     *              - country
     *              - state
     *              - city
     *              - country_state
     *              - state_city
     *            properties:
     *              name:
     *                type: string
     *                default: john
     *              description:
     *                type: string
     *                default: doe
     *              country:
     *                type: array
     *                default: ["India"]
     *              state:
     *                type: array
     *                default: ["Delhi"]
     *              city:
     *                type: array
     *                default: ["Anad vihar"]
     *              country_state:
     *                type: array
     *                default: [[0]]
     *              state_city:
     *                type: array
     *                default: [[0]]
     *     responses:
     *      201:
     *        description: Created
     *      409:
     *        description: Conflict
     *      404:
     *        description: Not Found
     *      500:
     *        description: Server Error
     */
router.put('/edit', async function (req, res) {
    let { id} = req.body;
    if (!id)
        {
            res.status(400)
            .send(new error("Send Proper data."));
    } else {
    try {
        var result = await oController.edit(req.body);
        //console.log(result);
        res.status(200)
            .send(result)
        } catch (error) {
            console.log(error);
            
            res.status(400)
            .send(error);
        }
    }
})
  /** POST Methods */
    /**
     * @openapi
     * '/organization/list':
     *  get:
     *     tags:
     *     - Organization Controller
     *     summary: Get Organization List
     *     security:
     *          bearerAuth: [read]
     *     requestBody:
     *      required: true
     *      content:
     *        application/json:
     *           schema:
     *            type: object
     *     responses:
     *      201:
     *        description: Created
     *      409:
     *        description: Conflict
     *      404:
     *        description: Not Found
     *      500:
     *        description: Server Error
     */
router.get('/list', async function (req, res) {
    try {
        var result = await oController.getListByLoggedInUser();        
        res.status(200)
            .send(result)
    } catch (error) {
        console.log(error);
        res.status(400)
            .send(error);
    }
});
router.get('/:id', async function (req, res) {
    let { id} = req.params;
    try {
    var result = await oController.getOrganizationById(id);
    res.status(200)
        .send(result)
    } catch (error) {
        res.status(400)
        .send(error);
    }
})
router.post('/addUser', async function (req, res) {
    let { orgId, userEmail, userTypeId, orgCountryStateCityId } = req.body;
    if(!orgId || !userEmail || !userTypeId || !orgCountryStateCityId) {
        res.status(400)
            .send(new error("Send Proper data."));
    } else {
        try {
            var result = await oController.addUser(req.body);
            res.status(200)
                .send(result)
        } catch (error) {
            console.log(error);
            res.status(400)
                .send(error);
        }
    }
})
module.exports = router;