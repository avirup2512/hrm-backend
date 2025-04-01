var express = require('express');
var router = express.Router();
var error = require('../class/error');

const mysql = require('mysql');
const connection = require("../class/sql/mysqlDbConnection");
var userController = require("../controller/user")

let con = new connection(mysql);
let connectionObject = con.getConnection();
con.connect(connectionObject);
var user = new userController(con, connectionObject);
router.use('/',(req, res, next) => {
    next();
})
/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});
 /** POST Methods */
    /**
     * @openapi
     * '/users/editUser':
     *  put:
     *     tags:
     *     - User Controller
     *     summary: Edit existing a user
     *     security:
     *          bearerAuth: [read]
     *     requestBody:
     *      required: true
     *      content:
     *        application/json:
     *           schema:
     *            type: object
     *            required:
     *              - firstName
     *              - lastName
     *              - email
     *              - password
     *              - address
     *            properties:
     *              firstName:
     *                type: string
     *                default: john
     *              lastName:
     *                type: string
     *                default: doe
     *              email:
     *                type: string
     *                default: johndoe@mail.com
     *              password:
     *                type: string
     *                default: johnDoe20!@
     *              address:
     *                type: string
     *                default: kolkata
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
router.put('/editUser', async function (req, res) {
     try {
       var response = await user.editUser(req.body);
       console.log(response);
       
          res.status(response.status)
            .send({
            response
          })
        } catch (err) {
          res.status(400)
          .send(new error(err));
        }
})
 /** POST Methods */
    /**
     * @openapi
     * '/users/deleteUser':
     *  delete:
     *     tags:
     *     - User Controller
     *     summary: Delete existing a user
     *     security:
     *          bearerAuth: [read]
     *     requestBody:
     *      required: true
     *      content:
     *        application/json:
     *           schema:
     *            type: object
     *            required:
     *              - email
     *            properties:
     *              email:
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
router.delete('/deleteUser', async function (req, res) {
    try {
      var response = await user.deleteUser(req.body);       
          res.status(response.status)
            .send({
            response
          })
        } catch (err) {
          res.status(400)
          .send(new error(err));
        }
})

module.exports = router;
