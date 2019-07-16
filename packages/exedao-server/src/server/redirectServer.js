var http = express.createServer();

http.get('*', function(req, res) {  
    res.redirect('https://' + req.headers.host + req.url);
})

http.listen(80);