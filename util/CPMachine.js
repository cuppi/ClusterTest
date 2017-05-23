/**
 * Created by cuppi on 2017/5/20.
 */


const util = require('util');
const PlatformDAO = require('./PlatformDAO');
const KMeans = require('./K-Means');
const Tool = require('./Tool');
const _ = require('lodash');
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

                });
            });
            let minClusterCount = Math.max(list[0].length, list[1].length, list[2].length);
            let maxClusterCount = list[0].length + list[1].length + list[2].length;
            // for (let i = 0; i < length; i++) {
            //     let s = list[0][i].name + list[1][i].name + list[2][i].name;
            // }

            // let pointList = [
            //     {x: 2.0, y: 10.0, id: 1},
            //     {x: 2.0, y: 5.0, id: 2},
            //     {x: 8.0, y: 4.0, id: 3},
            //     {x: 5.0, y: 8.0, id: 4},
            //     {x: 7.0, y: 5.0, id: 5},
            //     {x: 6.0, y: 4.0, id: 6},
            //     {x: 1.0, y: 2.0, id: 7},
            //     {x: 4.0, y: 9.0, id: 8},
            //     {x: 7.0, y: 3.0, id: 9},
            //     {x: 1.0, y: 3.0, id: 10},
            //     {x: 3.0, y: 9.0, id: 11}
            // ];

            let dataList = list[0].concat(list[1]).concat(list[2]);
            let pointList = dataList.map((cinema, index) => {
                return {
                    x: cinema.longitude * 1000,
                    y: cinema.latitude * 1000,
                    id: index,
                    name: cinema.name,
                    address: cinema.address
                };
            });
            let pointListCopy = dataList.map((cinema, index) => {
                return {
                    x: cinema.longitude * 1000,
                    y: cinema.latitude * 1000,
                    id: index,
                    name: cinema.name,
                    address: cinema.address
                };
            });
            //0.03652921197475326
            let result;
            let regularCount = minClusterCount;
            result = KMeans.default().washCluster(pointList, regularCount).map(point => {
                return {
                    x: point.x,
                    y: point.y,
                    id: point.id,
                    clusterId: parseInt(point.cluster.id),
                    address: point.address,
                    name: point.name
                };
            });
            result.sort((a, b) => {
                let aId = a.clusterId;
                let bId = b.clusterId;
                if (aId > bId) {
                    return 1;
                }
                if (aId < bId) {
                    return -1;
                }
                return 0;
            });
            let curClusterId = -1;
            let clusterMap = {};
            console.log('初始K: ' + regularCount);
            /************************* 簇分离 ********************/
            result.forEach((point) => {
                // console.log("( %d, %d | %d)\t in cluster-%d", point.x, point.y, point.id, point.clusterId);
                let index = parseInt(point.id);
                let cinema = pointList[index];
                if (point.clusterId !== curClusterId) {
                    // console.log('*************************************');
                    curClusterId = point.clusterId;
                    clusterMap[point.clusterId + ''] = []
                }
                // console.log(cinema.name);
                clusterMap[point.clusterId].push(cinema);
            });

            for (let key in clusterMap) {
                regularCount += this.divideCluster(clusterMap[key]);
            }

            let resultRegularCount;
            do {
                let clusterMap = {};
                resultRegularCount = regularCount;
                console.log('纠正后K: ' + regularCount);
                /************************* 二次纠正后的新K值聚类 ********************/
                result = KMeans.default().washCluster(pointList, regularCount).map(point => {
                    return {
                        x: point.x,
                        y: point.y,
                        id: point.id,
                        clusterId: parseInt(point.cluster.id),
                        address: point.address,
                        name: point.name
                    };
                });
                result.sort((a, b) => {
                    let aId = a.clusterId;
                    let bId = b.clusterId;
                    if (aId > bId) {
                        return 1;
                    }
                    if (aId < bId) {
                        return -1;
                    }
                    return 0;
                });
                let curClusterId = -1;
                result.forEach((point) => {
                    // console.log("( %d, %d | %d)\t in cluster-%d", point.x, point.y, point.id, point.clusterId);
                    let index = parseInt(point.id);
                    let cinema = pointList[index];
                    if (point.clusterId !== curClusterId) {
                        curClusterId = point.clusterId;
                        clusterMap[point.clusterId + ''] = []
                    }
                    clusterMap[point.clusterId].push(cinema);
                });

                for (let key in clusterMap) {
                    // console.log('*************** 6666  **********************');
                    let s = this.divideCluster(clusterMap[key]);
                    regularCount += s;
                }
                if (regularCount > pointList.length){
                    console.log('异常');
                    break;
                }
            } while (resultRegularCount !== regularCount)

            result.forEach((point) => {
                let index = parseInt(point.id);
                let cinema = pointList[index];
                if (point.clusterId !== curClusterId) {
                    console.log('*************************************');
                    curClusterId = point.clusterId;
                }
                console.log(cinema.name + '     |   ' + cinema.address);
            });
        });
    }

    divideCluster(points) {
        let n = 0;
        for (let i = 0; i < points.length; i++) {
            for (let j = i + 1; j < points.length; j++) {
                if (i != j) {
                    let distance = this.abstractDistance(points[i], points[j]);
                    // console.log(distance);
                    if (distance > 1.8) {
                        n++;

                        // console.log(points[i].name + ' | ' + points[j].name);
                        // console.log(points[i].address + ' | ' + points[j].address);
                        // console.log(points[i].x + ' | ' + points[j].x);
                        // console.log(points[i].y + ' | ' + points[j].y);
                        // console.log('抽象距离为:    ' + distance);
                    }
                }
            }
        }
        // console.log(n);
        return n ? 1 : 0;
    }

    abstractDistance(cinemaA, cinemaB) {
        let nameDistance = this.nameDistance(cinemaA.name, cinemaB.name);
        let coordinateDistance = this.coordinateDistance({
            longitude: cinemaA.x / 1000,
            latitude: cinemaA.y / 1000
        }, {longitude: cinemaB.x / 1000, latitude: cinemaB.y / 1000});
        let addressDistance = this.addressDistance(cinemaA.address, cinemaB.address);
        let euclideanDistance =
            nameDistance * nameDistance
            + addressDistance * addressDistance
        ;
        return euclideanDistance;
    }

    nameDistance(nameA, nameB) {
        nameA = this.clearNameGarbage(nameA);
        nameB = this.clearNameGarbage(nameB);

        let nameAList = nameA.split('');
        let nameBList = nameB.split('');
        let intersection = _.intersection(nameAList, nameBList).length;
        let union = _.union(nameAList, nameBList).length;

        if (_.intersection(intersection, nameAList).length === Math.min(intersection.length, nameAList.length)
            || _.intersection(intersection, nameBList).length === Math.min(intersection.length, nameBList.length)){
            return 0;
        }
        return 1 - intersection / union;
    }

    coordinateDistance(coordinateA, coordinateB) {
        return 0;
        return Tool.getDistance(coordinateA, coordinateB) / 50;
    }

    addressDistance(addressA, addressB) {
        addressA = this.clearAddressGarbage(addressA);
        addressB = this.clearAddressGarbage(addressB);
        let addressAList = addressA.split('');
        let addressBList = addressB.split('');
        let intersection = _.intersection(addressAList, addressBList).length;
        let union = _.union(addressAList, addressBList).length;

        if (_.intersection(intersection, addressAList).length === Math.min(intersection.length, addressAList.length)
        || _.intersection(intersection, addressBList).length === Math.min(intersection.length, addressBList.length)){
            return 0;
        }
        return 1 - intersection / union;
    }

    clearNameGarbage(name) {
        name = name.replace(/上海市/g, '');
        name = name.replace(/上海/g, '');
        name = name.replace(/电影院/g, '');
        name = name.replace(/电影城/g, '');
        name = name.replace(/影院/g, '');
        name = name.replace(/影城/g, '');
        return name;
    }
    
    clearAddressGarbage(address){
        address.replace(/上海市/g, '');
        address.replace(/浦东新区/g, '');
        address.replace(/徐汇区/g, '');
        address.replace(/黄浦区/g, '');
        address.replace(/静安区/g, '');
        address.replace(/松江区/g, '');
        address.replace(/闵行区/g, '');
        address.replace(/嘉定区/g, '');
        address.replace(/普陀区/g, '')
        address.replace(/宝山区/g, '');
        address.replace(/虹口区/g, '');
        address.replace(/闸北区/g, '');


        return address;
    }

    static run() {
        this.defaultManager().doSomeThing();
    }

}

module.exports = CPMachine;