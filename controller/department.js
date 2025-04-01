var createQuery = require("../class/sql/createQuery");
const error = require("../class/error");
const response = require("../class/response");
var departmentController = (function () {
    let connection;
    let connectionObject;
    function department(connection,connectionObject) {
        this.connection = connection;
        this.connectionObject = connectionObject;
    }
    department.prototype.checkExists = async function (name) {
        return this.connection.query(this.connectionObject,"SELECT * FROM department WHERE name='" + name + "'")
            .then(function (data) {
                if (data.length == 0)
                    return false;
                else
                    return true;
            }).catch(function (err) {
                return true;
        })
    }
      department.prototype.checkExistsById = async function (id) {
        return this.connection.query(this.connectionObject,"SELECT * FROM department WHERE id='" + id + "'")
            .then(function (data) {
                if (data.length == 0)
                    return false;
                else
                    return true;
            }).catch(function (err) {
                return true;
        })
    }
    department.prototype.create = async function (param)
    {
        let res = new response();
        let { name, description } = param;
        let insertQuery = "INSERT INTO department (name,description)" +
            "VALUES('" + name + "','" + description + "')";
        var hasDepartment = await this.checkExists(name);
        if (hasDepartment)
        {
            res.message = "Department is already exists";
            res.status = 400;
            return res;
        } else {
            return this.connection.query(this.connectionObject, insertQuery)
            .then(function (data) {
            res.message = "Department Has been created";
            res.status = 200;
                res.data = data;
            return res;
            }).catch(function (err) {
                res.message = err;
                res.status = 400;
                return res;
            })
        }
    }
    department.prototype.edit = async function (param)
    {
        let res = new response();
        let { id,name, description } = param;
        let updateQuery = "UPDATE department SET name = '" + name + "',description = '" + description + "'" +
            "WHERE id='" + id + "'";
        var hasDepartment = await this.checkExistsById(id);
        console.log(hasDepartment);
        if (hasDepartment)
        {
            return this.connection.query(this.connectionObject, updateQuery)
            .then(function (data) {                    
                res.message = "Department Has been updated";
                res.status = 200;
                res.data = data;
                return res;
            })
            .catch(function (err) {
                res.message = err;
                res.status = 400;
                return res;
            })
        }
    }
    department.prototype.delete = async function (param) {
    
    }
    return department;
})();
module.exports = departmentController;