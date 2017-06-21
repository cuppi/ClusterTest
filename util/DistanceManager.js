/**
 * Created by cuppi on 2017/5/27.
 */

const _ = require('lodash');
const Tool = require('./Tool');
class DistanceManager {

    static standardizedEuclideanDistance(vectorA, vectorB) {
        let addressS = 0.025;
        let addressE = 0.5;
        let nameS = 0.083333;
        let nameE = 0.5;


        let left = 73.40;
        let right = 135.230;
        let width = right - left;
        let top = 53.33;
        let bottom = 3.52;
        let height = top - bottom;
        let latitudeE = (73.40 + 135.230) * 0.5;
        let longitudeE = (53.33 + 3.52) * 0.5;


        let latitudeS = 0.33333 * Math.pow(right - latitudeE, 3) - 0.33333 * Math.pow(left - latitudeE, 3);
        let longitudeS = 0.33333 * Math.pow(right - longitudeE, 3) - 0.33333 * Math.pow(left - longitudeE, 3);

        let coorS = (1 / 6) * (Math.pow(top, 3) - Math.pow(bottom, 3)) * (Math.pow(right, 2) - Math.pow(left, 2))

        let nameDistance = this.nameDistance(vectorA.cinema.name, vectorB.cinema.name);
        let addressDistance = this.addressDistance(vectorA.cinema.address, vectorB.cinema.address);
        let coordinateDistance = this.coordinateDistance({
            longitude: vectorA.x / 1000,
            latitude: vectorA.y / 1000
        }, {longitude: vectorB.x / 1000, latitude: vectorB.y / 1000});



        let d2 = Math.pow(nameDistance, 2) / nameS
            + Math.pow(addressDistance, 2) / addressS
            + Math.pow((vectorA.x - vectorB.x) / 1000, 2) / longitudeS
            + Math.pow((vectorA.y - vectorB.y) / 1000, 2) / latitudeS;
        console.log(Math.pow(nameDistance, 2) / nameS);
        return Math.sqrt(d2);
    }

    static abstractDistance(cinemaA, cinemaB) {
        let s = this.standardizedEuclideanDistance(cinemaA, cinemaB);
        return s;
        let nameDistance = this.nameDistance(cinemaA.cinema.name, cinemaB.cinema.name);
        let coordinateDistance = this.coordinateDistance({
            longitude: cinemaA.x / 1000,
            latitude: cinemaA.y / 1000
        }, {longitude: cinemaB.x / 1000, latitude: cinemaB.y / 1000});


        let addressDistance = this.addressDistance(cinemaA.cinema.address, cinemaB.cinema.address);
        let euclideanDistance =
            nameDistance * nameDistance
            + addressDistance * addressDistance
        ;
        return euclideanDistance;
    }

    static nameDistance(nameA, nameB) {
        nameA = this.clearNameGarbage(nameA);
        nameB = this.clearNameGarbage(nameB);

        let nameAList = nameA.split('');
        let nameBList = nameB.split('');
        let intersection = _.intersection(nameAList, nameBList).length;
        let union = _.union(nameAList, nameBList).length;

        if (_.intersection(intersection, nameAList).length === Math.min(intersection.length, nameAList.length)
            || _.intersection(intersection, nameBList).length === Math.min(intersection.length, nameBList.length)) {
            return 0;
        }
        return 1 - intersection / union;
    }

    static coordinateDistance(coordinateA, coordinateB) {
        return Tool.getDistance(coordinateA, coordinateB) / 50;
    }

    static addressDistance(addressA, addressB) {
        addressA = this.clearAddressGarbage(addressA);
        addressB = this.clearAddressGarbage(addressB);
        let addressAList = addressA.split('');
        let addressBList = addressB.split('');
        let intersection = _.intersection(addressAList, addressBList).length;
        let union = _.union(addressAList, addressBList).length;

        if (_.intersection(intersection, addressAList).length === Math.min(intersection.length, addressAList.length)
            || _.intersection(intersection, addressBList).length === Math.min(intersection.length, addressBList.length)) {
            return 0;
        }
        return 1 - intersection / union;
    }

    static clearNameGarbage(name) {
        name = name.replace(/上海市/g, '');
        name = name.replace(/上海/g, '');
        name = name.replace(/电影院/g, '');
        name = name.replace(/电影城/g, '');
        name = name.replace(/影院/g, '');
        name = name.replace(/影城/g, '');
        return name;
    }

    static clearAddressGarbage(address) {
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


}

module.exports = DistanceManager;