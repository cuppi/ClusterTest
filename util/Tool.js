/**
 * Created by cuppi on 2017/5/23.
 */


let EARTH_RADIUS = 6378.137;//地球半径
class Tool {

    static rad(d) {
        return d * Math.PI / 180.0;
    }

    /**
     * 根据两点的经纬度，计算出其之间的距离（返回单位为km）
     * @param lat1 纬度1
     * @param lng1 经度1
     * @param lat2 纬度2
     * @param lng2 经度2
     * @return */
    static getDistance(point1, point2) {
        let radLat1 = this.rad(point1.latitude);
        let radLat2 = this.rad(point2.latitude);
        let a = radLat1 - radLat2;
        let b = this.rad(point1.longitude) - this.rad(point2.longitude);
        let s = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(a / 2), 2) +
                Math.cos(radLat1) * Math.cos(radLat2) * Math.pow(Math.sin(b / 2), 2)));
        s = s * EARTH_RADIUS;
        s = Math.round(s * 10000) / 10000.0;
        return s;
    }
}

module.exports = Tool;