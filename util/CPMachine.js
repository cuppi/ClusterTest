/**
 * Created by cuppi on 2017/5/20.
 */


const util = require('util');
const PlatformDAO = require('./PlatformDAO');
const KMeans = require('./K-Means');
const Tool = require('./Tool');
const DistanceManager = require('./DistanceManager');
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
            let minClusterCount = Math.max(list[0].length, list[1].length, list[2].length);
            let maxClusterCount = list[0].length + list[1].length + list[2].length;
            let dataList = list[0].concat(list[1]).concat(list[2]);

            let pointList = dataList.map((cinema, index) => {
                return {
                    x: cinema.longitude * 1000,
                    y: cinema.latitude * 1000,
                    id: index,
                    cinema: cinema
                };
            });

            let result;
            let regularCount = minClusterCount;
            result = KMeans.default().washCluster(pointList, regularCount).map(point => {

                return {
                    x: point.x,
                    y: point.y,
                    id: point.id,
                    clusterId: parseInt(point.cluster.id),
                    address: point.address,
                    name: point.name,
                    cinema: point.cinema
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

            // 计算需要增加的分组数目
            console.log('初始K: ' + regularCount);
            regularCount += this.divideClusterIncreaseCount(result, pointList);

            let resultRegularCount;
            do {

                resultRegularCount = regularCount;
                let clusterMap = {};
                console.log('纠正后K: ' + regularCount);
                /************************* 二次纠正后的新K值聚类 ********************/
                result = KMeans.default().washCluster(pointList, regularCount).map(point => {
                    return {
                        x: point.x,
                        y: point.y,
                        id: point.id,
                        clusterId: parseInt(point.cluster.id),
                        address: point.address,
                        name: point.name,
                        cinema: point.cinema
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

                console.log('初始K: ' + regularCount);
                regularCount += this.divideClusterIncreaseCount(result, pointList);
                if (regularCount > pointList.length) {
                    console.log('异常');
                    break;
                }
            } while (resultRegularCount !== regularCount)




            let curClusterId = -1
            result.forEach((resultPoint) => {
                let index = parseInt(resultPoint.id);
                let point = pointList[index];
                if (resultPoint.clusterId !== curClusterId) {
                    console.log('*************************************');
                    curClusterId = resultPoint.clusterId;
                }
                console.log(point.cinema.name + '     |   ' + point.cinema.address);
            });
        });
    }

    divideClusterIncreaseCount(resultList, pointList) {
        let clusterMap = {};
        /************************* 簇分离 ********************/
        resultList.forEach((resultPoint) => {
            let index = parseInt(resultPoint.id);
            let point = pointList[index];
            if (!clusterMap.hasOwnProperty(resultPoint.clusterId + '')) {
                clusterMap[resultPoint.clusterId + ''] = []
            }
            clusterMap[resultPoint.clusterId + ''].push(point);
        });
        let sum = 0;
        for (let key in clusterMap) {
            sum += this.divideCluster(clusterMap[key]);
        }
        return sum;
    }

    divideCluster(points) {
        let n = 0;
        for (let i = 0; i < points.length; i++) {
            for (let j = i + 1; j < points.length; j++) {
                if (i != j) {
                    let distance = DistanceManager.abstractDistance(points[i], points[j]);
                    // console.log(distance);
                    if (distance > 100) {
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

    static run() {
        this.defaultManager().doSomeThing();
    }

}

module.exports = CPMachine;