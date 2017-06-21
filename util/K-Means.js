/**
 * Created by cuppi on 2017/5/22.
 */

const DistanceManager = require('./DistanceManager');

class KMeans {
    constructor() {
    }

    static default() {
        return new KMeans();
    }

    /**
     * 获取欧几里得距离
     * @param point1 点A
     * @param point2 点B
     * @returns {*}
     */
    getDistance(point1, point2) {
        return DistanceManager.abstractDistance(point1, point2);
        // this.getDistance(abstractDistance)
        // let xd = (point1.x - point2.x);
        // let yd = (point1.y - point2.y);
        // return Math.sqrt(xd * xd + yd * yd);
    }

    /**
     * 计算平方误差函数
     * @param list
     * @returns {number}
     */
    getVariance(list) {
        let cnt = 0.0, sum = 0.0;
        for (let j = 0; j < list.length; j++) {
            let point = list[j];
            if (point.cluster) {
                let xd = point.x - point.cluster.x;
                let yd = point.y - point.cluster.y;
                sum += xd * xd + yd * yd;
            }
        }
        return sum;
    }

    /**
     * 计算每个簇的中心点
     * @param subList
     * @param clusterList
     */
    calculateClusterCenter(subList, clusterList) {
        let clusterMap = {};
        for (let j = 0; j < clusterList.length; j++) {
            let point = subList[j];
            //  如果第j个点的中心(簇)在第i个簇里
            if (!clusterMap.hasOwnProperty(point.cluster.id)) {
                clusterMap[point.cluster.id] = {x: 0, y: 0, count: 0};
            }
            clusterMap[point.cluster.id].x += point.x;
            clusterMap[point.cluster.id].y += point.y;
            clusterMap[point.cluster.id].count++;
        }
        for (let _ in clusterMap) {
            if (clusterMap.hasOwnProperty(_)) {
                let count = clusterMap[_].count;
                if (count > 0) {
                    let x = clusterMap[_].x / count;
                    let y = clusterMap[_].y / count;
                    this.setCluster(clusterList, _, x, y);
                }
            }
        }

        clusterList.forEach((cluster) => {
            // console.log("The new center point of %d is : \t( %d, %d )\n", cluster.id, cluster.x, cluster.y);
        })
    }


    /**
     * 聚集所有的点到指定簇
     * @param subList
     * @param clusterList
     */
    gatherPoint(subList, clusterList) {
        for (let i = 0; i < subList.length; i++) {
            let distance = [];
            let point = subList[i];
            for (let j = 0; j < clusterList.length; j++) {

                distance[j] = this.getDistance(point, clusterList[j]);
            }

            let min = Number.MAX_VALUE;
            for (let j = 0; j < clusterList.length; j++) {
                if (distance[j] < min) {
                    min = distance[j];
                    point.cluster = clusterList[j];
                }
            }

            // console.log("( %d, %d )\t in cluster-%d", point.x, point.y, point.cluster.id);
        }
        // console.log("-----------------------------");
        return subList;
    }

    /**
     * 聚类接口方法
     * @param pointList
     * @param clusterNumber
     */
    washCluster(pointList, clusterNumber) {
        let subList = pointList.map(point => {
            return {
                x: point.x,
                y: point.y,
                cluster: null,
                id: point.id,
                name: point.name,
                address: point.address,
                cinema: point.cinema
            };
        });
        let noisty = this.separateNoisyPoint(subList);
        subList = subList.filter(point => {
            return noisty.indexOf(point.id) === -1;
        });
        let clusterProbablyList = [];
        do {
            let random = parseInt(Math.random() * pointList.length);
            if (clusterProbablyList.indexOf(random) === -1) {
                clusterProbablyList.push(random);
            }
        } while (clusterProbablyList.length != clusterNumber)

        let clusterList = subList.filter((point, index) => {
            return clusterProbablyList.indexOf(index) !== -1;
        }).map((point, index) => {
            return {x: point.x, y: point.y, id: index + '', cinema: point.cinema};
        });


        //
        // this.calculateClusterCenter(subList, clusterList);
        // subList = this.gatherPoint(subList, clusterList);
        //
        // let variance2 = this.getVariance(subList);

        // while (Math.abs(variance2 - variance1) > 1)   ///  比较两次平方误差 判断是否相等，不相等继续迭代
        // {
        //     variance1 = variance2;
        //     this.calculateClusterCenter(subList, clusterList);
        //     subList = this.gatherPoint(subList, clusterList);
        //     variance2 = this.getVariance(subList);
        //     n++;
        //     console.log("The E%d is: %d\n", n, variance2);
        // }

        let n = 0;
        let variance1 = 0, variance2;
        this.gatherPoint(subList, clusterList);
        variance2 = this.getVariance(subList);
        this.calculateClusterCenter(subList, clusterList);
        do {
            variance1 = variance2;
            this.gatherPoint(subList, clusterList);
            variance2 = this.getVariance(subList);
            this.calculateClusterCenter(subList, clusterList);
        } while (Math.abs(variance2 - variance1) > 1)

        let point;
        let xCount = 0;
        let yCount = 0;
        for (let point of subList) {
            xCount += point.x;
            yCount += point.y;
        }

        this.clusterElbow(clusterList, subList, {x: xCount / subList.length, y: yCount / subList.length});
        return subList;
    }


    /**
     * 设置簇的中心
     * @param clusterList
     * @param id
     * @param x
     * @param y
     */
    setCluster(clusterList, id, x, y) {
        for (let cluster of clusterList) {
            if (cluster.id === id) {
                cluster.x = x;
                cluster.y = y;
                break;
            }
        }
    }


    /**
     * 分离噪点
     * @param subList
     */
    separateNoisyPoint(subList) {
        if (subList.length <= 0) {
            return;
        }
        let totalX = 0;
        let totalY = 0;
        let n = subList.length;
        for (let point of subList) {
            totalX += point.x;
            totalY += point.y;
        }

        let distX = [];
        let distY = [];
        for (let i = 0; i < n; i++) {
            let point = subList[i];
            distX.push(Math.abs(point.x - (totalX - point.x) / (n - 1)));
            distY.push(Math.abs(point.y - (totalY - point.y) / (n - 1)));
        }

        let distTotalX = 0;
        let distTotalY = 0;
        for (let i = 0; i < n; i++) {
            distTotalX += distX[i];
            distTotalY += distY[i];
        }
        let noisyPointList = [];
        for (let i = 0; i < n; i++) {
            //  1.5为聚集阀值
            if (distX[i] > (distTotalX - distX[i]) / (n - 1) * 1.5) {
                noisyPointList.push(i);
            }
        }
        // console.log('****************   噪点   ****************');
        // console.log(noisyPointList);
        return noisyPointList;

    }

    /**
     * 计算当前簇分布Elbow均值
     * @param clusterList
     * @param subList
     * @param allCenter
     */
    clusterElbow(clusterList, subList, allCenter) {

        for (let point of subList) {
            for (let cluster of clusterList) {
                if (!cluster.pointNumber) {
                    cluster.pointNumber = 0;
                }
                if (!cluster.pointList) {
                    cluster.pointList = [];
                }
                if (point.cluster === cluster) {
                    cluster.pointNumber++;
                    cluster.pointList.push(point);
                }
            }
        }
        // the sum of squares between groups
        let ssb = 0.0;
        for (let cluster of clusterList) {
            let xDistance2 = (cluster.x - allCenter.x) * (cluster.x - allCenter.x);
            let yDistance2 = (cluster.y - allCenter.y) * (cluster.y - allCenter.y);
            ssb += cluster.pointNumber * (xDistance2 + yDistance2)
            // console.log(yDistance2)
        }
        // the sum of squares total
        let sst = 0.0;
        for (let point of subList) {
            let xDistance2 = (point.x - allCenter.x) * (point.x - allCenter.x);
            let yDistance2 = (point.y - allCenter.y) * (point.y - allCenter.y);
            sst += (xDistance2 + yDistance2);
        }
        console.log('******************  Elbow  ******************');
        // console.log(ssb);
        // console.log(sst);
        console.log(ssb / sst);
    }
}

module.exports = KMeans;