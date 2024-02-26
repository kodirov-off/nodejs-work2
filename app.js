const http = require('http');
const fs = require('fs');
const path = require('path');

const server = http.createServer((req, res) => {
  let { method, url } = req;
  if(method === 'GET'){
    if(url === '/books'){
      res.writeHead(200, {"Content-Type": "text/html"});
      res.end(`<html>
      <head>
      <title>Books API</title>
      </head>
      <body>
      <h1>Welcome to the Books API!</h1>
      <p><a href="/api/books">View all books.</a></p>
      <a href="/api/add">Add book</a>
      <p><a href="/del">Delete Book</a></p>
      <form action="/api/book" method="GET">
      <h3>Search by id</h3>
      ID: <input type="text" name="id"><br />
      <input type="submit" value="Search" style="margin: 10px 25px;">
      </form>
      </body>
      </html>`)
    }else if(url === '/api/books'){
      fs.readFile(path.join(__dirname, 'books.json'), (err, data) =>{
        if(err) throw err
        let books = JSON.parse(data);
        let response = '<ul>';
        books.forEach(book => {
          response += `<li>${book.id} : ${book.title} -- ${book.author}</li>`;
        });
        response += '</ul>';
        res.writeHead(200, {'Content-Type': 'text/html'});
        response += `<a href="/books">Bosh sahifa</a>`
        res.end(response);  
      })
    }else if(url === '/api/add'){
      fs.readFile(path.join(__dirname, 'books.json'), 'utf8', (err, data) =>{
        if (err) throw err
        let maxId = 0;
        let books = JSON.parse(data);
        books.forEach(book => {
          if(maxId < book.id) maxId = book.id;
          
        });
        res.writeHeader(200, {"Content-type":"text/html"})
        res.end(`<form action="/newbook" method="POST">
        Id:  <input type="text" name="id" readonly value="${maxId+1}"><br/>
        Title: <input type="text" name="title" placeholder="title"><br>
        Author: <input type="text" name="author" placeholder="Author"><br>
        <button>Save</button><br><br> <a href="/books">Home page</a></form>`)
      })
    }else if(url.startsWith('/api/book?')){
      const id = req.data = url.split("=")[1];
      fs.readFile(path.join(__dirname, 'books.json'), 'utf8', (err, data) =>{
        if (err) throw err
        const books = JSON.parse(data);
        books.forEach(book => {
          if(book.id == id){
            res.writeHead(200, {"Content-Type": "text/html"})
            res.end(`<p>ID: ${book.id}</p>  <p>Title: ${book.title}</p> 
            <p>Author: ${book.author}</p> <br> <br>`)
          }
        });
        
      })
      
    }else if( url === '/del'){
      res.writeHead(200, {"Content-type":"text/html"});
      res.end(`<form action="/delete" method="DELETE">
      id: <input type="text" name="id" >
      <button>Delete</button>
      </form>`);
    }
  }else if(method === 'POST'){
    if(url.startsWith('/newbook')){
      req.on("data", chunk =>{
        let body;
        body = chunk.toString();
        
        
        const id = parseInt(body.split('=')[1].split('&')[0]);
        const title = body.split('=')[2].split('&')[0];
        const author = body.split('=')[3].split('&')[0];
        fs.readFile(path.join(__dirname, 'books.json'), 'utf8', (err, data) =>{
          if(err) throw err
          const books = JSON.parse(data);
          books.forEach(book => {
            if(book.title != title){    
              const arr = [...books];
              nBook = {id: id, 'title': title, 'author': author}
              arr.push(nBook);
              fs.unlinkSync(path.join(__dirname, 'books.json'), err =>{
                if(err) throw err
              })
              fs.writeFileSync(path.join(__dirname, 'books.json'), JSON.stringify(arr), err => {
                if(err) throw err
                console.log('ok');
              })
            } });
          })
        })
      }
    }else if(method === 'DELETE'){
      const id = url.split('=')[1];
      fs.readFile(path.join(__dirname, 'books.json'), 'utf8', (err, data) => {
        if (err) throw err;
        const books = JSON.parse(data);
        const updatedBooks = books.filter(book => book.id !== parseInt(id));
        fs.writeFileSync(path.join(__dirname, 'books.json'), JSON.stringify(updatedBooks), err => {
          if (err) throw err;
          console.log('Book deleted successfully');
        });
      });
    }else if(method === 'PUT'){
        if(url.startsWith('/api/book')){
            let body = '';
            req.on('data', chunk => {
                body += chunk.toString(); // convert Buffer to string
            });
            req.on('end', () => {
                const { id, title, author } = JSON.parse(body);
                fs.readFile(path.join(__dirname, 'books.json'), 'utf8', (err, data) => {
                    if (err) throw err;
                    const books = JSON.parse(data);
                    const bookIndex = books.findIndex(book => book.id === parseInt(id));
                    if (bookIndex !== -1) {
                        books[bookIndex].title = title;
                        books[bookIndex].author = author;
                        fs.writeFileSync(path.join(__dirname, 'books.json'), JSON.stringify(books), err => {
                            if (err) throw err;
                            res.writeHead(200, {"Content-Type": "application/json"});
                            res.end(JSON.stringify({ message: "Book updated successfully" }));
                        });
                    } else {
                        res.writeHead(404, {"Content-Type": "application/json"});
                        res.end(JSON.stringify({ message: "Book not found" }));
                    }
                });
            });
        }
    }
    
    
  })
  
  server.listen(2000);