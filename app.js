var express  =  require( 'express' );
var multer   =  require( 'multer' );
//var upload   =  multer( { dest: 'uploads/' } );
var sizeOf   =  require( 'image-size' );
var exphbs   =  require( 'express-handlebars' );
var PythonShell = require('python-shell');
//var pdfDocument = require('pdfkit');
var connections = {}; 
var res;
require( 'string.prototype.startswith' );
var app = express();
var expressWS = require('express-ws')(app);

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'upload/')
  },
  filename: function (req, file, cb) {
	  connections[file.originalname] = [];
	  console.log(file);
    cb(null,req.body.id + '.jpg') //Appending .jpg
  }
});
app.ws('/', function(ws, req) {
  ws.on('message', function(msg) {
	console.log(msg);
    if (msg != "Connected"){
		ws.send(msg);
		connections[msg + ".jpg"] = ws; 
		//console.log(connections);
		//connections.push(ws);
	}
  });
});
var fs = require('fs');
fs.watch(__dirname + '/images', {encoding: 'buffer'}, function (eventType, filename) {
			if (filename)
				console.log(filename);
				console.log("hihihi");
				var jpegfile = fs.readFileSync(__dirname + '/images/' + filename);
				console.log(filename);
				connections[filename].send(jpegfile);
				//connections.forEach(function(c) {c.send(jpegfile)})

    // Prints: <Buffer ...>
		});
var runPyScript = function(file, arg) {
	var options = {
		mode: 'text',
		  //pythonPath: 'C:\\Users\\Keshev\\AppData\\Local\\Enthought\\Canopy\\User\\Scripts',
		  //pythonOptions: ['-u'],
		  //scriptPath: 'C:\\Users\\Keshev\\Canopy\\PokeDex\\startupWS',
		  args: [arg]
	};
	var pyshell = new PythonShell('C:\\Users\\Keshev\\Canopy\\PokeDex\\startupWS\\webObjRec.py',options)
	pyshell.on('message', function (err, results) {
		if (err) console.log(err);
		// results is an array consisting of messages collected during execution
		console.log('results: %j', results);
		});
	pyshell.stdout.on('data', function(data) {
		var pth = data;
		console.log(pth);
		//var jpegfile = fs.readFileSync(pth);
		//connections.forEach(function(c) {c.send(jpegfile)})

	});
	
	}
	/* Setup POST response
	app.post('/post_pdf', function(req, res) {
		// Create PDF
		var doc = new pdfDocument();

		// Write headers
		res.writeHead(200, {
			'Content-Type': 'application/pdf',
			'Access-Control-Allow-Origin': '*',
			'Content-Disposition': 'attachment; filename=Untitled.pdf'
		});

		// Pipe generated PDF into response
		doc.pipe(res);

		// Process image
		request({
			url: pth,
			encoding: null // Prevents Request from converting response to string
		}, function(err, response, body) {
			if (err) throw err;

			// Inject image
			doc.image(body); // `body` is a Buffer because we told Request
							 // to not make it a string

			doc.end(); // Close document and, by extension, response
			return;	
			});
	};*/
var upload = multer({ storage: storage,});
app.use( express.static( __dirname + '/bower_components' ) );
app.use("/style",  express.static(__dirname + '/style'));
app.use("/scripts", express.static(__dirname + '/scripts'));
app.use("/images",  express.static(__dirname + '/images'));
app.use("/bootstrap",  express.static(__dirname + '/bootstrap'));
app.use("/font-awesome-4.6.3",  express.static(__dirname + '/font-awesome-4.6.3'));
app.use("/semantic",  express.static(__dirname + '/semantic'));



app.engine( '.hbs', exphbs( { extname: '.hbs' } ) );
app.set('view engine', '.hbs');

app.get( '/', function( req, res, next ){
  return res.sendFile( __dirname + '/views/index.html' );
});

app.post( '/upload', upload.single( 'file' ), function( req, res, next ) {

  if ( !req.file.mimetype.startsWith( 'image/' ) ) {
    return res.status( 422 ).json( {
      error : 'The uploaded file must be an image'
    } );
  }
  var dimensions = sizeOf( req.file.path );

  /*if ( ( dimensions.width < 640 ) || ( dimensions.height < 480 ) ) {
    return res.status( 422 ).json( {
      error : 'The image must be at least 640 x 480px'
    } );
  }*/
  console.log(__dirname + "\\" + req.file.path);
  runPyScript("a",__dirname + "\\" + req.file.path);
  console.log(req.file.path);
  
  return res.status( 200 ).send( req.file );
});

app.listen( 8080, function() {
  console.log( 'Express server listening on port 8080' );
});