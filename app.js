// SETTING CONFIGURATION START
const config = require('./config');
process.env.NODE_ENV = config.env;
// SETTING CONFIGURATION ENDS

var express = require('express');
const cors = require('cors');
const port = 8089;
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var error = require('./class/error');
const jwt = require("jsonwebtoken");
const mysql = require('mysql');
const connection = require("./class/sql/mysqlDbConnection");
const createQuery = require("./class/sql/createQuery");

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var orgRouter = require('./routes/organization');
var departmentRouter = require('./routes/department');
var authentication = require('./routes/authentication/authentication');
var globalData = require('./class/globalData');

const swaggerUI = require('swagger-ui-express');
const swaggerSpec = require('./swagger');

var app = express();
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerSpec));
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
const corsOpts = {
    origin: 'http://localhost:4200'
};
app.use(cors(corsOpts));
app.use(cors(corsOpts), function (req, res, next) {
    console.log(req.url.split('/')[1]);
    if (req.url.split('/')[1] !== "auth")
    {
        const token = req.headers.authorization ? req.headers.authorization.split(' ')[1] : null;
        console.log(token);
        if (!token)
        {
            let err = new error("Token is needed");
            res.status(400)
                .send(err.msg);
        }else
        {
            try {
                const decodedToken = jwt.verify(token, config.secretKey);
                let { userEmail, password } = decodedToken;
                const con = new connection(mysql);
                let connect = con.getConnection();
                con.connect(connect);
                try {
                    con.query(connect, "SELECT email, password FROM user")
                        .then(function (data) {
                        if (!data || data.length == 0) {
                            let err = new error("User does'nt exists");
                            res.status(400)
                                .send(err.msg);
                        } else {
                            globalData.userEmail = userEmail;
                            next();
                            //con.stop(connect);
                        }
                        }).catch(function (err) {
                            console.log(err);
                    })
                } catch (r) {
                    let err = new error(r);
                    res.status(400)
                    .send(err.msg);
                }
            } catch (r) {
                console.log(error);
                let err = new error(r);
            res.status(400)
                .send(err.msg);
            }
        }
    } else {
        next();
    }
});
app.use('/',cors(corsOpts), indexRouter);
app.use('/users', usersRouter);
app.use('/organization', orgRouter);
app.use('/department', departmentRouter);
app.use('/auth',cors(corsOpts), authentication);

app.listen(port, () => {
    console.log("App has been started.");
})
async function createTables()
{
    let con = new connection(mysql);
    let connectionObject = con.getConnection();
    con.connect(connectionObject);
    // ROLE TABLE CREATE
    var roleTableExists = await con.checkTableExists(connectionObject,"hrm","role");
    if(!roleTableExists)
    {
        con.createTable(connectionObject, createQuery.createRoleTable)
            .then(function (data) {
                var queryString = "INSERT INTO role (role) VALUES ('ROLE_BASIC'),('ROLE_ADMIN'),('ROLE_SUPER_ADMIN')";
                console.log(data);
                con.query(connectionObject, queryString)
                .then(function (data) {
                    console.log(data);
                }).catch(function (err) {
                    console.log(err);
                })
            }).catch(function (err) {
                console.log(err);
        })
    }
    // ORGANIZATION TABLE CREATE
    var organizationTableExists = await con.checkTableExists(connectionObject,"hrm","organization");
    if(!organizationTableExists)
    {
        con.createTable(connectionObject, createQuery.createOrGanizationTable)
            .then(function (data) {
                console.log(data);
            }).catch(function (err) {
                console.log(err);
        })
    }
     // ORGANIZATION COUNTRY ROLE TABLE CREATE
    var organizationCountryTableExists = await con.checkTableExists(connectionObject,"hrm","organization_country");
    if(!organizationCountryTableExists)
    {
        con.createTable(connectionObject, createQuery.createOrGanizationCountryTable)
            .then(function (data) {
                console.log(data);
            }).catch(function (err) {
                console.log(err);
        })
    };
    // ORGANIZATION COUNTRY STATE ROLE TABLE CREATE
    var organizationCountryStateTableExists = await con.checkTableExists(connectionObject,"hrm","organization_country_state");
    if(!organizationCountryStateTableExists)
    {
        con.createTable(connectionObject, createQuery.createOrGanizationCountryStateTable)
            .then(function (data) {
                console.log(data);
            }).catch(function (err) {
                console.log(err);
        })
    };
    // ORGANIZATION COUNTRY STATE CITY ROLE TABLE CREATE
    var organizationCountryStateCityTableExists = await con.checkTableExists(connectionObject,"hrm","organization_country_state_city");
    if(!organizationCountryStateCityTableExists)
    {
        con.createTable(connectionObject, createQuery.createOrGanizationCountryStateCityTable)
            .then(function (data) {
                console.log(data);
            }).catch(function (err) {
                console.log(err);
        })
    };
    // USER TABLE CREATE
    var userTableExists = await con.checkTableExists(connectionObject,"hrm","user");
    if(!userTableExists)
    {
        con.createTable(connectionObject, createQuery.createUsersTable)
            .then(function (data) {
                console.log(data);
            }).catch(function (err) {
                console.log(err);
        })
    }
    // LOCATION TABLE CREATE
    var locationTableExists = await con.checkTableExists(connectionObject,"hrm","location");
    if(!locationTableExists)
    {
        con.createTable(connectionObject, createQuery.createLocationTable)
            .then(function (data) {
                console.log(data);
            }).catch(function (err) {
                console.log(err);
        })
    }
    // USER ROLE TABLE CREATE
    var userRoleTableExists = await con.checkTableExists(connectionObject,"hrm","user_role");
    if(!userRoleTableExists)
    {
        con.createTable(connectionObject, createQuery.createUserRoleTable)
            .then(function (data) {
                console.log(data);
            }).catch(function (err) {
                console.log(err);
        })
    };
    // USER ROLE TABLE CREATE
    var DepartmentTableExists = await con.checkTableExists(connectionObject,"hrm","department");
    if(!DepartmentTableExists)
    {
        con.createTable(connectionObject, createQuery.createDepartMentTable)
            .then(function (data) {
                console.log(data);
            }).catch(function (err) {
                console.log(err);
        })
    };
    // USER ROLE TABLE CREATE
    var DepartmentOrganizationTableExists = await con.checkTableExists(connectionObject,"hrm","organization_department");
    if(!DepartmentOrganizationTableExists)
    {
        con.createTable(connectionObject, createQuery.createDepartMentOrganizationTable)
            .then(function (data) {
                console.log(data);
            }).catch(function (err) {
                console.log(err);
        })
    };
    // Organization User
    var OrganizationUserTableExists = await con.checkTableExists(connectionObject,"hrm","organization_user");
    if(!OrganizationUserTableExists)
    {
        con.createTable(connectionObject, createQuery.createOrganizationUserTable)
            .then(function (data) {
                console.log(data);
            }).catch(function (err) {
                console.log(err);
        })
    };
    // USER TYPE TABLE CREATE
    var UserTypeTableExists = await con.checkTableExists(connectionObject,"hrm","user_type");
    if(!UserTypeTableExists)
    {
        con.createTable(connectionObject, createQuery.createUserTypeTable)
            .then(function (data) {
                let InitialValues = ['CREATOR', 'EMPLOYEE', 'VIEWER'];
                function addInitialValue(idx, array) {
                    if (idx > array.length - 1)
                        return;
                    let InsertQuery = "INSERT INTO `user_type` (type) VALUES('" + array[idx] + "')";
                    con.query(connectionObject, InsertQuery)
                        .then(function (data) {
                            console.log(data);
                        })
                        .catch(function (err) {
                            reject(err);
                        });                    
                    addInitialValue(idx + 1, array);
                };
                addInitialValue(0, InitialValues);
            }).catch(function (err) {
                console.log(err);
        })
    };
    // con.stop(connectionObject);
}
createTables();
module.exports = app;
