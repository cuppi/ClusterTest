/**
 * Created by cuppi on 2017/5/20.
 */

let host = '139.196.138.67';
let user = 'root';
let password = '7l_X_0qYhP';
let database = 'superfilm_beta';
const CinemaModel = require('../model/CinemaModel');

class PlatformDAO{
    static getDBConnection() {
        var mysql = require('mysql');
        var connection = mysql.createConnection({
            host: host,
            user: user,
            password: password,
            database: database
        });
        connection.connect();
        return connection;
    }

    static queryPromise(connection, query) {
        return new Promise((resolve, rejectt) => {
            connection.query(query, function (error, results, fields) {
                if (error) {
                    throw error
                }
                resolve(results);
            });
        });
    }

    /**
     * 网票网
     * @returns {*}
     */
    static wpCinemaList() {
        let connection = this.getDBConnection();
        return new Promise((resolve, reject) => {
            this.queryPromise(connection, 'SELECT * FROM wangpiao_cinema WHERE CityID = 2').then(list => {
                connection.end();
                let smartList = [];
                for (let cinema of list) {
                    smartList.push(new CinemaModel(cinema.Name, cinema.Address, cinema.longitude, cinema.latitude));
                }
                resolve(smartList);
            }, error => {
                connection.end();
                console.log(error);
            });
        });
    }

    /**
     * 蜘蛛网
     * @returns {*}
     */
    static spCinemaList() {
        let connection = this.getDBConnection();
        return new Promise((resolve, reject) => {
            this.queryPromise(connection, 'SELECT * FROM spider_cinema WHERE cityId = \'shanghai\'').then(list => {
                connection.end();
                let smartList = [];
                for (let cinema of list) {
                    smartList.push(new CinemaModel(cinema.cinemaName, cinema.cinemaADD, cinema.longitude, cinema.latitude));
                }
                resolve(smartList);
            }, error => {
                connection.end();
                console.log(error);
            });
        });
    }

    /**
     * 卖座网
     * @returns {*}
     */
    static mzCinemaList() {
        let connection = this.getDBConnection();
        return new Promise((resolve, reject) => {
            this.queryPromise(connection, 'SELECT * FROM maizuo_cinema WHERE cityId = 11').then(list => {
                connection.end();
                let smartList = [];
                for (let cinema of list) {
                    smartList.push(new CinemaModel(cinema.cinemaName, cinema.address, cinema.longitude, cinema.latitude));
                }
                resolve(smartList);
            }, error => {
                connection.end();
                console.log(error);
            });
        });
    }
}

module.exports = PlatformDAO;