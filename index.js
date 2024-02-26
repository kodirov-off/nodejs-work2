const http = require('http');
const fs = require('fs');

const booksFilePath = 'books.json';

const server = http.createServer((req, res) => {
    const { method, url } = req;

    if (method === 'GET' && url === '/books') {
        fs.readFile(booksFilePath, 'utf8', (err, data) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Internal Server Error' }));
                return;
            }

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(data);
        });
    } else if (method === 'GET' && url.startsWith('/books/')) {
        const id = parseInt(url.substring(7));
        fs.readFile(booksFilePath, 'utf8', (err, data) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Internal Server Error' }));
                return;
            }

            const books = JSON.parse(data);
            const book = books.find(book => book.id === id);
            if (book) {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(book));
            } else {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Book not found' }));
            }
        });
    } else if (method === 'POST' && url === '/books') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            const newBook = JSON.parse(body);
            fs.readFile(booksFilePath, 'utf8', (err, data) => {
                if (err) {
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Internal Server Error' }));
                    return;
                }

                const books = JSON.parse(data);
                const existingBook = books.find(book => book.title === newBook.title);
                if (existingBook) {
                    res.writeHead(409, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Book already exists' }));
                } else {
                    const maxId = Math.max(...books.map(book => book.id));
                    newBook.id = maxId + 1;
                    books.push(newBook);
                    fs.writeFile(booksFilePath, JSON.stringify(books, null, 2), err => {
                        if (err) {
                            res.writeHead(500, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({ error: 'Internal Server Error' }));
                            return;
                        }

                        res.writeHead(201, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify(newBook));
                    });
                }
            });
        });
    } else if (method === 'PUT' && url.startsWith('/books/')) {
        const id = parseInt(url.substring(7));
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            const updatedBook = JSON.parse(body);
            fs.readFile(booksFilePath, 'utf8', (err, data) => {
                if (err) {
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Internal Server Error' }));
                    return;
                }

                let books = JSON.parse(data);
                const index = books.findIndex(book => book.id === id);
                if (index !== -1) {
                    books[index] = { ...books[index], ...updatedBook };
                    fs.writeFile(booksFilePath, JSON.stringify(books, null, 2), err => {
                        if (err) {
                            res.writeHead(500, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({ error: 'Internal Server Error' }));
                            return;
                        }

                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify(books[index]));
                    });
                } else {
                    res.writeHead(404, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Book not found' }));
                }
            });
        });
    } else if (method === 'DELETE' && url.startsWith('/books/')) {
        const id = parseInt(url.substring(7));
        fs.readFile(booksFilePath, 'utf8', (err, data) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Internal Server Error' }));
                return;
            }

            let books = JSON.parse(data);
            const index = books.findIndex(book => book.id === id);
            if (index !== -1) {
                const deletedBook = books.splice(index, 1)[0];
                fs.writeFile(booksFilePath, JSON.stringify(books, null, 2), err => {
                    if (err) {
                        res.writeHead(500, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ error: 'Internal Server Error' }));
                        return;
                    }

                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(deletedBook));
                });
            } else {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Book not found' }));
            }
        });
    } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Not Found' }));
    }
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
