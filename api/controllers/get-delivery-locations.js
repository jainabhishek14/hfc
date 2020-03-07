const fs = require('fs');
const path = require('path');
const xmlReader = require('read-xml');
const nodeGeocoder = require('node-geocoder');
const convert = require('xml-js');
const geolib = require('geolib');

const THRESHOLD_DISTANCE = 3000; // 3KM Radius Assumption (Not mentioned in the problem statement)

const FILE = path.join(__dirname, '../kml/outlets.kml');

const getAllOutlets = () => {
    return new Promise((resolve, reject) => xmlReader.readXML(fs.readFileSync(FILE), function(err, data) {
        if (err) {
            console.error(err);
            reject(err);
        }

        const result = JSON.parse(convert.xml2json(data.content, { compact: true, spaces: 4 }));
        resolve(result.kml.Document.Placemark.filter(item => item.hasOwnProperty('Polygon')));
    }));
};

function getNearest(outletLocations, userLocation) {
    let locations = [];
    outletLocations.forEach(outlet => {
        const coordinates = outlet.Polygon.outerBoundaryIs.LinearRing.coordinates._text.split("\n").map(item => item.trim()).filter(item => item !== '');
        locations.push({name: outlet.name._text, coordinates });
    });

    let nearestLocation = [];
    locations.forEach(location => {
        let distances = [];
        location.coordinates.forEach(coords => {
            const points = coords.split(",");
            if (
                geolib.isPointWithinRadius({
                    latitude: userLocation[0].latitude,
                    longitude: userLocation[0].longitude,
                },{
                    latitude: points[1],
                    longitude: points[0]
                }, THRESHOLD_DISTANCE)
            ) {
                distances.push(
                    geolib.getDistance(
                        {
                            latitude: userLocation[0].latitude,
                            longitude: userLocation[0].longitude,
                        },
                        {
                            latitude: points[1],
                            longitude: points[0],
                        },
                    ),
                );
            }
        });
        if (distances.length) {
            nearestLocation.push({
                location: location.name,
                distance: Math.min(...distances),
            });
        }
    });
    if(nearestLocation.length){
        nearestLocation = nearestLocation.sort(
            (a, b) => a.distance - b.distance,
        )[0];
        return nearestLocation.location;
    }
    return "Not Found.";
}

const getGeoCode =  address => {
    const options = {
        provider: 'openstreetmap',
    };

    const geoCoder = nodeGeocoder(options);
    return geoCoder
        .geocode(address)
}

const getLocations = async address => {
    const geoCode = await getGeoCode(address);
    if(geoCode.length){
        return await getNearest(await getAllOutlets(), geoCode);
    }
    return false;
}


exports.getLocations = getLocations;