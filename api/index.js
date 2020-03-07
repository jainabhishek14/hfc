const express = require('express');
const bodyParser = require('body-parser');
const xss = require('xss-clean');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cors = require('cors');

const { getLocations } = require("./controllers/get-delivery-locations");

const app = express();

//Configure isProduction variable
const isProduction = process.env.NODE_ENV === 'production';

//Congifure our app

app.use(
	helmet(),
	bodyParser.urlencoded({ extended: false }),
	bodyParser.json(),
);

if (!isProduction) {
	app.use(cors());
	app.options(
		'*',
		cors({ origin: ["*"]}),
	);
}

const limit = rateLimit({
	max: 100, //maxRequests
	windowMs: 60 * 60 * 1000, // 1 Hour
	message: 'Too many requests',
});

app.use(limit);

app.use(express.json({ limit: '10kb' }), xss());

app.use((err, req, res, next) => {
	res.status(err.status || 500);

	res.json({
		errors: {
			message: err.message,
			error: err,
		},
	});
});
app.get('/', (req, res, next) => {
	res.status(200).json('Delivery API is live');
});

app.post('/', async (req, res) => {
    if(req.body.hasOwnProperty("userLocation") && req.body.userLocation && req.body.userLocation !== ""){
        const outlet = await getLocations(req.body.userLocation);
        if(outlet){
            return res.status(200).json({ location: outlet });
        }
        return res.status(400).json({ error: 'Invalid Address' });
    }
    return res.status(400).json({error: "Invalid Request"});
});

const port = process.env.PORT || 5000;

app.listen(port, () =>
	console.log(`Delivery API in now live on port: ${port}`),
);
module.exports = app;