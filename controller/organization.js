var createQuery = require("../class/sql/createQuery");
const error = require("../class/error");
const response = require("../class/response");
const globalData = require("../class/globalData");
var organizationController = (function () {
    let connection;
    let connectionObject;
    let user;
    function organization(connection,connectionObject,user) {
        this.connection = connection;
        this.connectionObject = connectionObject;
        this.user = user;
    }
    function sqlCityCall(idx, city, state_city, org_country_state_id, self) {        
        if (idx > state_city.length - 1)
            return;
        let insertQuery = "INSERT IGNORE INTO organization_country_state_city (org_country_state_id,city)" +
            " VALUES('" + org_country_state_id + "','" + city[state_city[idx]] + "')";
        let pr = new Promise((resolve, reject) => { 
            self.connection.query(self.connectionObject, insertQuery)
            .then(function (data) {
                resolve(true);
            })
            .catch(function (err)
            {
                reject(err);
            })
        })
        var pr2 = sqlCityCall(idx + 1, city,state_city,org_country_state_id,self);
        return Promise.all([pr, pr2]);
    }
    function sqlStateCall(idx, state, city, country_state, state_city, org_country_id, self){       
        if (idx > country_state.length - 1)
            return;
        let insertQuery3 = "INSERT organization_country_state (org_country_id,state)" +
            "VALUES('" + org_country_id + "','" + state[country_state[idx]] + "')";
        let pr = new Promise((resolve, reject) => { 
            self.connection.query(self.connectionObject, insertQuery3)
            .then(function (data) {
                sqlCityCall(0, city, state_city[country_state[idx]], data.insertId, self)
                .then(function (data2) {
                    resolve(true);
                })
            })
            .catch(function (err)
            {
                reject(err);
            })
        })
        var pr2 = sqlStateCall(idx + 1, state,city,country_state,state_city,org_country_id,self);
        return Promise.all([pr, pr2]);
    }
    function sqlCall(idx,country,state,city,country_state,state_city,self,org_id)
    {
        if(idx > country.length-1)
            return;
        let insertQuery2 = "INSERT organization_country (org_id,country)" +
                            "VALUES('" + org_id + "','" + country[idx] + "')";
        let pr = new Promise((resolve, reject) => {
            self.connection.query(self.connectionObject,insertQuery2)
                .then(function (data) {
                    sqlStateCall(0, state, city, country_state[idx], state_city, data.insertId, self)
                    .then(function (data2) {
                        resolve(true);
                    })
            })
            .catch(function (err)
            {
                reject(err);
            })
        })
        let pr2 = sqlCall(idx + 1, country,state,city,country_state,state_city,self,org_id);
        return Promise.all([pr, pr2]);
    }
    function dqlDepartmentCall(idx, department,org_id,self)
    {
        if (idx > department.length - 1)
            return;
        let insertQuery = "INSERT organization_department (org_id,dept_id)" +
                            "VALUES('" + org_id + "','" + department[idx] + "')";
        let pr = new Promise((resolve, reject) => {
            self.connection.query(self.connectionObject,insertQuery)
                .then(function (data) {
                    resolve(true);
            })
            .catch(function (err)
            {
                reject(err);
            })
        })
        let pr2 = dqlDepartmentCall(idx + 1,department,org_id,self);
        return Promise.all([pr, pr2]);
    }
    function getList()
    {
        let res = new response();
        let selectQuery = "SELECT `organization`.name,`organization`.description,`organization_country`.country, `organization_country_state`.state, `organization_country_state_city`.city  FROM `organization`" +
            " INNER JOIN `organization_country` ON `organization`.id=`organization_country`.org_id" +
            " INNER JOIN `organization_country_state` ON `organization_country`.id=`organization_country_state`.org_country_id" +
            " INNER JOIN `organization_country_state_city` ON `organization_country_state`.id=`organization_country_state_city`.org_country_state_id";
        // " WHERE `organization_country`.org_id='" + id + "'";
        return this.connection.query(this.connectionObject, selectQuery)
        .then(function (data) {
            return data;
        }).catch(function (err) {
            res.message = err;
            res.status = 400;
            return res;
        })
    }
    organization.prototype.checkExists = async function (orgName) {
        return this.connection.query(this.connectionObject,"SELECT * FROM organization WHERE name='" + orgName + "'")
            .then(function (data) {
                if (data.length == 0)
                    return false;
                else
                    return true;
            }).catch(function (err) {
                return false;
        })
    }
    organization.prototype.checkExistsById = async function (id) {
        return this.connection.query(this.connectionObject,"SELECT * FROM organization WHERE id='" + id + "'")
            .then(function (data) {
                if (data.length == 0)
                    return false;
                else
                    return true;
            }).catch(function (err) {
                return false;
        })
    }
    function deleteCountry(idx, country,org_id,self)
    {
        if(idx > country.length - 1)
            return;
        let deleteQuery = "DELETE oc,ocs,ocsc FROM organization_country oc JOIN organization_country_state ocs ON oc.id = ocs.org_country_id"+
            " JOIN organization_country_state_city ocsc ON ocs.id = ocsc.org_country_state_id"+
            " WHERE oc.id = '" + country[idx] + "'";
        let pr = new Promise((resolve, reject) => {
            self.connection.query(self.connectionObject,deleteQuery)
                .then(function (data) {
                    resolve(data);
            })
            .catch(function (err)
            {
                reject(err);
            })
        })
        let pr2 = deleteCountry(idx + 1, country,org_id,self);
        return Promise.all([pr, pr2]);
    }
    function deleteState(idx, state,self)
    {
        if(idx > state.length - 1)
            return;
        let deleteQuery = "DELETE ocs,ocsc FROM organization_country_state ocs"+
            " JOIN organization_country_state_city ocsc ON ocs.id = ocsc.org_country_state_id"+
            " WHERE ocs.id = '" + state[idx].id + "'";
        let pr = new Promise((resolve, reject) => {
            self.connection.query(self.connectionObject,deleteQuery)
                .then(function (data) {
                    resolve(data);
            })
            .catch(function (err)
            {
                reject(err);
            })
        })
        let pr2 = deleteState(idx + 1, state,self);
        return Promise.all([pr, pr2]);
    }
    function deleteCity(idx, city,self)
    {
        if(idx > city.length - 1)
            return;
        let deleteQuery = "DELETE FROM organization_country_state_city"+
            " WHERE id = '" + city[idx].id + "'";
        let pr = new Promise((resolve, reject) => {
            self.connection.query(self.connectionObject,deleteQuery)
                .then(function (data) {
                    resolve(data);
            })
            .catch(function (err)
            {
                reject(err);
            })
        })
        let pr2 = deleteCity(idx + 1, city,self);
        return Promise.all([pr, pr2]);
    }
    function addCity(idx,city,org_country_state_id,self)
    {        
        if (idx > city.length - 1)
            return;
        let query = "INSERT `organization_country_state_city` (org_country_state_id,city)" +
            "VALUES('" + org_country_state_id + "','" + city[idx] + "')";
        let pr = new Promise((resolve, reject) => {
            self.connection.query(self.connectionObject, query)
                .then(function (data) { 
                    resolve(data);
                }).catch(function (err)
                {
                    reject(err);
                })
        })
        let pr2 = addCity(idx + 1, city, org_country_state_id, self);
        return Promise.all([pr, pr2]);
    }
    function addState(idx,state,city,state_city,org_country_id,self)
    {
        if (idx > state.length - 1)
            return;
        let query = "INSERT `organization_country_state` (org_country_id,state)" +
            "VALUES('" + org_country_id + "','" + state[idx].name + "')";
        let pr = new Promise((resolve, reject) => {
            self.connection.query(self.connectionObject, query)
                .then(function (data) { 
                    sqlCityCall(0, city, state_city[idx], data.insertId, self)
                    .then(function (data2) {
                        resolve(data2);
                    }).catch(function (err)
                    {
                        reject(err);
                    })
                }).catch(function (err)
                {
                    reject(err);
                })
        })
        let pr2 = addState(idx + 1, state, city, state_city, org_country_id, self)
        return Promise.all([pr, pr2]);
    }
    function checkExistingStateCity(idx,existingState,city,state_city,self)
    {
        if (idx > existingState.length - 1)
            return;
        let Query = "SELECT id,city FROM `organization_country_state_city` WHERE org_country_state_id=" + existingState[idx].id + "";
        let pr = new Promise((resolve, reject) => {
            self.connection.query(self.connectionObject, Query)
                .then(function (data) {
                    let fetchedExistingCities = data;
                    let cityMap = new Map();
                    fetchedExistingCities.forEach((e) => {
                        cityMap.set(e.city, e.id);
                    })
                    let cityName = [];
                    if (state_city[existingState[idx].index].length > 0)
                    {
                        state_city[existingState[idx].index].forEach((e) => {
                            cityName.push(city[e])
                        })
                    }
                    let cityToBeAdded = [];
                    cityName.forEach((e, i) => {
                        if(!cityMap.has(e))
                        {
                            cityToBeAdded.push(e);
                        };
                    });
                    if (cityToBeAdded.length > 0)
                    {
                        addCity(0,cityToBeAdded,existingState[idx].id,self)
                    }
                    let cityToBeRemoved = [];
                    fetchedExistingCities.forEach((e) => {
                        cityMap.set(e.city, e.id);
                        if (city.indexOf(e.city) == -1) {
                            cityToBeRemoved.push(e);
                        }
                    });
                    if (cityToBeRemoved.length > 0)
                    {
                        deleteCity(0, cityToBeRemoved, self);
                    }
                })
                .catch(function (err)
                {
                    reject(err);
                })
        })
        let pr2 = checkExistingStateCity(idx + 1, existingState, city, state_city, self);
        return Promise.all([pr, pr2]);
    }
    function checkExistingCountryState(idx, country,country_state,state,city,state_city,self)
    {
        if (idx > country.length - 1)
            return;
        let Query = "SELECT id,state FROM `organization_country_state` WHERE org_country_id=" + country[idx].id + "";
        let pr = new Promise((resolve, reject) => {
            self.connection.query(self.connectionObject,Query)
                .then(function (data) {
                    let fetchedExistingStates = data;
                    let stateMap = new Map();
                    fetchedExistingStates.forEach((e) => {
                        stateMap.set(e.state, e.id);
                    })
                    let stateName = [];
                    country_state[country[idx].index].forEach((e) => {
                        stateName.push({name:state[e], index:e})
                    });
                    let stateToBeAdded = [];
                    let existingState = [];
                    stateName.forEach((e, i) => {
                        if(!stateMap.has(e.name))
                        {
                            stateToBeAdded.push({name:e.name,index:i});
                        } else {
                            existingState.push({name:e.name,index:e.index,id:stateMap.get(e.name)})
                        }
                    });
                    if(stateToBeAdded.length > 0)
                    {
                        let state_city2 = [];
                        stateToBeAdded.forEach((e) => {
                            state_city2.push(state_city[e.index]);
                        });
                        addState(0,stateToBeAdded,city,state_city2,country[idx].id,self);
                    };
                    let stateToBeRemoved = [];
                    fetchedExistingStates.forEach((e) => {
                        if (state.indexOf(e.state) == -1)
                            stateToBeRemoved.push(e);
                    });
                    if(stateToBeRemoved.length > 0)
                        deleteState(0, stateToBeRemoved, self);;
                    if (existingState.length > 0)
                    {
                        checkExistingStateCity(0, existingState,city,state_city,self);
                    }
            })
            .catch(function (err)
            {
                reject(err);
            })
        })
    var pr2 = checkExistingCountryState(idx + 1, country, country_state, state, city, state_city, self);
        return Promise.all([pr,pr2]);
    }
    organization.prototype.create = async function (param)
    {
        let res = new response();
        let self = this;
        let { name, description, country, state, city, country_state, state_city, department } = param;
        let hasOrg = await this.checkExists(name);
        if (!hasOrg)
        {
            let insertQuery = "INSERT organization (name,description)" +
            "VALUES('" + name + "','" + description + "')";
            return this.connection.query(this.connectionObject, insertQuery)
                .then(async function (response)
                {
                    let pr;
                    let pr2;
                    if (department && department.length > 0)
                        pr = dqlDepartmentCall(0, department, response.insertId,self);
                    pr2 = sqlCall(0, country, state, city, country_state, state_city, self, response.insertId);
                    let selectUser = "SELECT * FROM user WHERE email='" + globalData.userEmail + "'";                    
                    let pr3 = new Promise((resolve, reject) => {
                        self.connection.query(self.connectionObject, selectUser)
                            .then(function (data) {                                                                
                                resolve({user:data})
                            }).catch(function (err) {
                                reject(err);
                            })
                    });
                    let selectUserType = "SELECT * FROM user_type WHERE type='CREATOR'";
                    let pr4 = new Promise((resolve, reject) => {
                        self.connection.query(self.connectionObject, selectUserType)
                            .then(function (data)
                            {
                                resolve({userType:data})
                            }).catch(function (err) {
                                reject(err);
                            })
                    })
                    let pr6 = await Promise.all([pr3, pr4]).then(function (data) {
                        let userId;
                        let userTypeId;
                        if (data.length > 0) {
                            data.forEach(function (e) {
                                if (e.hasOwnProperty("user"))
                                    userId = e.user[0].id;
                                else if (e.hasOwnProperty("userType"))
                                    userTypeId = e.userType[0].id;
                            })
                        };
                        if (userId && userTypeId) {
                            let query = "INSERT INTO `organization_user`(org_id,user_id,user_type_id) " +
                                "VALUES('" + response.insertId + "','" + userId + "','" + userTypeId + "')";
                            new Promise((resolve, reject) => {
                                self.connection.query(self.connectionObject, query)
                                    .then(function (data) {
                                        resolve({ org_id: response.insertId })
                                    }).catch(function (err) {
                                        reject(err);
                                    })
                            })
                        }
                    });
                    let p7 = new Promise((res, rej) => {
                        res({org_id:response.insertId})
                    })
                    return Promise.all([pr, pr2, pr6, p7]);
                }).catch(function (err) {
                    res.message = err;
                    res.status = 400;
                    return res;
                })
        } else {
            res.message = "Organization is already exists";
            res.status = 400; 
            return res;
        }
    }

    organization.prototype.edit = async function(param)
    {
        let res = new response();
        let self = this;
        let {id, name, description, country, state, city, country_state, state_city, department } = param;
        var hasOrganization = await this.checkExistsById(id);
        if (hasOrganization)
        {
            let updateQuery = "UPDATE organization SET name = '" + name + "',description = '" + description + "'" +
            "WHERE id='" + id + "'";
            this.connection.query(this.connectionObject, updateQuery)
            .then(async function (data) {                    
                let fetchExistingCountries = [];
                let selectCountryQuery = "SELECT id,country FROM `organization_country` WHERE org_id='" + id + "'";
                await self.connection.query(self.connectionObject, selectCountryQuery)
                    .then(function (data) {
                        fetchExistingCountries = data;
                    });            
                let countryMap = new Map();
                fetchExistingCountries.forEach(function (e) {                    
                    countryMap.set(e.country, e.id);
                })
                let countryToBeAdded = [];
                let existingCountry = [];
                let stateToBeAdded = [];
                country.forEach((e, i) => {
                    if(!countryMap.has(e))
                    {
                        countryToBeAdded.push(e);
                        stateToBeAdded.push(country_state[i]);
                    } else {
                        existingCountry.push({id:countryMap.get(e),index:i});
                    }
                });
                if(countryToBeAdded.length > 0)
                {
                    sqlCall(0, countryToBeAdded, state, city, stateToBeAdded, state_city, self, id);
                }
                let countryToBeRemoved = [];
                fetchExistingCountries.forEach((e, i) => {
                    if(country.indexOf(e.country) == -1)
                    {
                        countryToBeRemoved.push(e.id);
                    }
                });
                if (countryToBeRemoved.length > 0)
                {
                    deleteCountry(0, countryToBeRemoved, id,self);
                }
                if (existingCountry.length > 0)
                {
                    checkExistingCountryState(0, existingCountry,country_state,state,city,state_city,self);
                }
            });
        }
        else {
            res.message = "Organization does not exists";
            res.status = 404;
            return res;
        }
    }
    // STRUCTURE OF orgArray IN getListByLoggedInUser FUNCTION
    /*[
    RowDataPacket {
    org_id: 1,
    org_country_state_city_id: null,
    type: 'CREATOR'
    },
    RowDataPacket {
    org_id: 2,
    org_country_state_city_id: null,
    type: 'CREATOR'
    },
    RowDataPacket {
    org_id: 3,
    org_country_state_city_id: 34,
    type: 'VIEWER'
    }
] */
    function getListByLoggedInUser(idx, orgArray,self)
    {
        if (idx > orgArray.length - 1)
            return [];
        let selectQuery = "";
        if (orgArray[idx].type == "VIEWER")
        {
            selectQuery = " SELECT ocsc.city,ocs.state,oc.country,o.description,o.name FROM `organization_country_state_city` ocsc" +
            " INNER JOIN `organization_country_state` ocs ON ocsc.org_country_state_id = ocs.id" +
            " INNER JOIN `organization_country` oc ON ocs.org_country_id = oc.id" +
            " INNER JOIN `organization` o ON oc.org_id = o.id" +
            " WHERE ocsc.id='" + orgArray[idx].org_country_state_city_id + "' AND o.id='" + orgArray[idx].org_id + "'";
        } else if(orgArray[idx].type == "CREATOR"){
            selectQuery = " SELECT ocsc.city,ocs.state,oc.country,o.description,o.name FROM `organization_country_state_city` ocsc" +
            " INNER JOIN `organization_country_state` ocs ON ocsc.org_country_state_id = ocs.id" +
            " INNER JOIN `organization_country` oc ON ocs.org_country_id = oc.id" +
            " INNER JOIN `organization` o ON oc.org_id = o.id" +
            " WHERE o.id='" + orgArray[idx].org_id + "'";
        }
        let pr = new Promise((resolve, reject) => {
            self.connection.query(self.connectionObject, selectQuery)
                .then(function (data) {        
                    data.forEach((e) => {
                        Object.assign(e,{userType:orgArray[idx].type})
                    })
                    resolve(data);
                }).catch(function (err) {          
                    reject(err);
                })
        });
        let pr2 = getListByLoggedInUser(idx + 1, orgArray, self);
        return Promise.all([pr, pr2]).then(([value,rest])=>[value,...rest])
    }
    organization.prototype.getListByLoggedInUser = async function ()
    {        
        let self = this;
        let res = new response();
        let selectUserQuery = "SELECT * FROM user WHERE email='" + globalData.userEmail + "'";                    
        return self.connection.query(self.connectionObject, selectUserQuery)
            .then(function (data) {
                console.log(data);
                if (data[0] && data[0].id != null) {
                    let query = "SELECT ou.org_id, ou.org_country_state_city_id, ut.type FROM `organization_user` ou " +
                    " INNER JOIN `user_type` ut ON ou.user_type_id = ut.id"+
                    " WHERE ou.user_id='" + data[0].id + "'";
                    return self.connection.query(self.connectionObject, query)
                        .then(function (data2) {
                            console.log(data2);
                            return getListByLoggedInUser(0, data2, self);
                        }).catch(function (err) {
                            console.log(err);
                            res.message = err;
                            res.status = 400;
                        })
                } else {
                    res.message = "No User";
                    res.status = 400;
                }
            }).catch(function (err) {
                res.message = err;
                res.status = 400;
                return res;
            });
    }
    organization.prototype.checkOrgCityByOrgId = function(org_id,org_country_state_city_id)
    {
        let selectQuery = "SELECT ocsc.id, ocs.id,oc.id,o.id FROM `organization_country_state_city` ocsc" +
            " INNER JOIN `organization_country_state` ocs ON ocsc.org_country_state_id = ocs.id" +
            " INNER JOIN `organization_country` oc ON ocs.org_country_id = oc.id" +
            " INNER JOIN `organization` o ON oc.org_id = o.id" +
            " WHERE o.id='" + org_id + "' AND ocsc.id ='" + org_country_state_city_id + "'";
            return this.connection.query(this.connectionObject, selectQuery)
            .then(function (data) { 
                if(data && data.length > 0)
                    return true;
                else
                    return false;
            }).catch(function (err) {
                return false;
        })
    }
    organization.prototype.addUser = async function(params)
    {
        let res = new response();
        let self = this;
        let { orgId, userEmail, userTypeId,orgCountryStateCityId } = params;
        var hasOrganization = await this.checkExistsById(orgId);
        var hasUser = await this.user.checkUserExists(userEmail);
        var hasCityInOrg = await this.checkOrgCityByOrgId(orgId,orgCountryStateCityId);
        if (hasOrganization && hasUser && hasCityInOrg)
        {
            let selectQuery = "SELECT * FROM user WHERE email='" + userEmail + "'";
            return this.connection.query(this.connectionObject, selectQuery)
                .then(function (data) {                
                let insertQuery = "INSERT `organization_user` (org_id,user_id,user_type_id,org_country_state_city_id)" +
                    " VALUES('" + orgId + "','" + data[0].id + "','" + userTypeId + "','"+ orgCountryStateCityId +"')";
                return self.connection.query(self.connectionObject, insertQuery)
                .then(function (data) {
                    return data;
                }).catch(function (err) {
                    res.message = err;
                    res.status = 400;
                    return res;
                })
            }).catch(function (err) {
                res.message = err;
                res.status = 400;
                return res;
            })
            
        }else {
            res.message = "Data does not exists";
            res.status = 404;
            return res;
        }
    }
    organization.prototype.getOrganizationById = async function (id)
    {        
        let res = new response();
        let selectQuery = "SELECT o.name,o.description,oc.country, ocs.state, ocsc.city  FROM `organization` o" +
            " INNER JOIN `organization_country` oc ON o.id=oc.org_id" +
            " INNER JOIN `organization_country_state` ocs ON oc.id = ocs.org_country_id" +
            " INNER JOIN `organization_country_state_city` ocsc ON ocs.id=ocsc.org_country_state_id"+
            " WHERE o.id='"+id+"'"        
        return this.connection.query(this.connectionObject, selectQuery)
        .then(function (data) {
            return data;
        }).catch(function (err) {
            res.message = err;
            res.status = 400;
            return res;
        })
    }
    return organization;
})();
module.exports = organizationController;