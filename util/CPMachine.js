/**
 * Created by cuppi on 2017/5/20.
 */


const util = require('util');
const PlatformDAO = require('./PlatformDAO');
const KMeans = require('./K-Means');
let _singlon = null;

class CPMachine {
    static defaultManager() {
        if (_singlon == null) {
            _singlon = new CPMachine();
        }
        return _singlon;
    }

    doSomeThing() {
        Promise.all([PlatformDAO.wpCinemaList(), PlatformDAO.spCinemaList(), PlatformDAO.mzCinemaList()]).then(list => {
            list.forEach(cinemaList => {
                cinemaList.forEach(cinema => {
                    cinema.name = cinema.name.replace(/上海市/g, '');
                    cinema.name = cinema.name.replace(/上海/g, '');
                });
            });
            let length = Math.min(list[0].length, list[1].length, list[2].length);
            for (let i = 0; i < length; i++) {
                let s = list[0][i].name + list[1][i].name + list[2][i].name;
            }

            let pointList = [
                {x: 2.0, y: 10.0},
                {x: 2.0, y: 5.0},
                {x: 8.0, y: 4.0},
                {x: 5.0, y: 8.0},
                {x: 7.0, y: 5.0},
                {x: 6.0, y: 4.0},
                {x: 1.0, y: 2.0},
                {x: 4.0, y: 9.0},
                {x: 7.0, y: 3.0},
                {x: 1.0, y: 3.0},
                {x: 3.0, y: 9.0}
            ];
            KMeans.default().washCluster(pointList);
        });
    }

    static run() {
        this.defaultManager().doSomeThing();
    }
}

module.exports = CPMachine;