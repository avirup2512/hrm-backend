
const express = require('express');
const jwt = require("jsonwebtoken");
const mysql = require('mysql');
const connection = require("../class/sql/mysqlDbConnection");
var router = express.Router();
var error = require('../class/error');
var departmentController = require("../controller/department")

let con = new connection(mysql);
let connectionObject = con.getConnection();
con.connect(connectionObject);
var dController = new departmentController(con, connectionObject);

  /** POST Methods */
    /**
     * @openapi
     * '/department/create':
     *  post:
     *     tags:
     *     - Department Controller
     *     summary: Create a new Department
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
     *            properties:
     *              name:
     *                type: string
     *                default: john
     *              description:
     *                type: string
     *                default: doe
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
    let { name, description } = req.body;
    if (!name) {
        res.status(400)
            .send(new error("Send Proper data."));
    } else {
        try {
            var result = await dController.create(req.body);
            res.status(result.status)
                .send(result)
        } catch (error) {
            console.log(error);
            
            res.status(345)
                .send(error);
        }
        
    }
});
  /** POST Methods */
    /**
     * @openapi
     * '/organization/edit':
     *  put:
     *     tags:
     *     - Department Controller
     *     summary: Edit a Department
     *     security:
     *          bearerAuth: [read]
     *     requestBody:
     *      required: true
     *      content:
     *        application/json:
     *           schema:
     *            type: object
     *            required:
     *              - id
     *              - name
     *              - description
     *            properties:
     *              id:
     *                type: number
     *                default: john
     *              name:
     *                type: string
     *                default: john
     *              description:
     *                type: string
     *                default: doe
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
    let { id, name, description} = req.body;
    if (!id)
        {
            res.status(400)
            .send(new error("Send Proper data."));
    } else {
        try {
            var result = await dController.edit(req.body);
            res.status(result.status)
            .send(result)
        } catch (error) {
            console.log(error);
            
            res.status(345)
            .send(error);
        }
        
    }
})
module.exports = router;