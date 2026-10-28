const express = require('express');
const mongoose = require('mongoose');
const Book = require('./models/Book');

const app = express();
app.use(express.json());

mongoose.connect('mongodb://127.0.0.1:27017/library')
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log(err));


app.post('/api/books', async (req, res) => {
    try {
        const { title, author, category } = req.body;

        if (!title) {
            return res.status(400).json({ message: 'Title is required' });
        }

        const book = new Book({ title, author, category });
        await book.save();

        res.status(201).json(book);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.get('/api/books', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        const books = await Book.find()
            .skip((page - 1) * limit)
            .limit(limit);

        const total = await Book.countDocuments();

        res.status(200).json({
            books,
            currentPage: page,
            totalRecords: total
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.patch('/api/books/:id', async (req, res) => {
    try {
        const book = await Book.findByIdAndUpdate(
            req.params.id,
            { availability: req.body.availability },
            { new: true, runValidators: true }
        );

        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }

        res.status(200).json(book);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.listen(3000, () => {
    console.log('Server running on port 3000');
});