/**
 * Created by cuppi on 2017/5/22.
 */

let K = 3

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
        let xd = (point1.x - point2.x);
        let yd = (point1.y - point2.y);
        return Math.sqrt(xd * xd + yd * yd);
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
        for (let j = 0; j < K; j++) {
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
            console.log("The new center point of %d is : \t( %d, %d )\n", cluster.id, cluster.x, cluster.y);
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
            for (let j = 0; j < K; j++) {
                distance[j] = this.getDistance(point, clusterList[j]);
            }

            let min = Number.MAX_VALUE;
            for (let j = 0; j < K; j++) {
                if (distance[j] < min) {
                    min = distance[j];
                    point.cluster = clusterList[j];
                }
            }

            console.log("( %d, %d )\t in cluster-%d", point.x, point.y, point.cluster.id);
        }
        console.log("-----------------------------");
        return subList;
    }

    /**
     * 聚类接口方法
     * @param pointList
     */
    washCluster(pointList) {
        let subList = pointList.map(point => {
            return {x: point.x, y: point.y, cluster: null};
        });
        let clusterList = [subList[0], subList[3], subList[6]].map((cluster, index) => {
            return {x: cluster.x, y: cluster.y, id: index + ''};
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
}

module.exports = KMeans;