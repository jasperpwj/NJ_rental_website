const express      = require('express'),
	  session      = require('express-session'),
      exphbs  	   = require('express-handlebars'),
      app          = express(),
	  static  	   = express.static(__dirname + '/public'),
	  configRoutes = require('./routes');

const rewriteUnsuppBrowserMethods = (req, res, next) => {
	if (req.body && req.body._method) {
		req.method = req.body._method;
		delete req.body._method;
	}
	next();
};

app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

app.use('/public', static);
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(rewriteUnsuppBrowserMethods);

/***************
*  Middleware  *
***************/
app.use(
	session({
		name: 'AuthCookie',
		secret: 'some secret string!',
		resave: false,
		saveUninitialized: true
	})
);

app.use(async (req, res, next) => {
	const now = new Date().toUTCString();
	let userText = "";
	if (req.session.user){
		userText = "Authenticated User";
	} else {
		userText = "Non-Authenticated User";
	}
	console.log(`[${now}]: ${req.method} ${req.originalUrl} (${userText})`);
	next();
});

app.use('/users/storehouse/:houseid', async (req, res, next) => {
	if (!req.session.user) {
		return res.status(401).render('usershbs/login');
	}
	next();
});

app.use('/users/removestorehouse/:houseid', async (req, res, next) => {
	if (!req.session.user) {
		return res.status(401).render('usershbs/login');
	}
	next();
});

/***********
*  Routes  *
***********/
configRoutes(app);

app.listen(3000, () => {
  console.log("We've now got a server!");
  console.log('Your routes will be running on http://localhost:3000');
});