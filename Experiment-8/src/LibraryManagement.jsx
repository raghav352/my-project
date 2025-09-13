import React, { useState } from "react";

const LibraryManagement = () => {
  const [books, setBooks] = useState([
    { title: "1984", author: "George Orwell" },
    { title: "The Great Gatsby", author: "F. Scott Fitzgerald" },
    { title: "To Kill a Mockingbird", author: "Harper Lee" },
  ]);
  const [searchTerm, setSearchTerm] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newAuthor, setNewAuthor] = useState("");

  // Add a new book
  const handleAddBook = () => {
    if (newTitle.trim() && newAuthor.trim()) {
      setBooks([...books, { title: newTitle, author: newAuthor }]);
      setNewTitle("");
      setNewAuthor("");
    }
  };

  // Remove a book by index
  const handleRemoveBook = (index) => {
    const updatedBooks = books.filter((_, i) => i !== index);
    setBooks(updatedBooks);
  };

  // Filter books by search term
  const filteredBooks = books.filter(
    (book) =>
      book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.author.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ border: "1px solid black", padding: "16px", maxWidth: "600px" }}>
      <h2>Library Management</h2>
      
      {/* Search */}
      <input
        type="text"
        placeholder="Search by title or author"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{ width: "100%", marginBottom: "10px" }}
      />

      {/* Add Book */}
      <div style={{ marginBottom: "16px" }}>
        <input
          type="text"
          placeholder="New book title"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          style={{ marginRight: "8px" }}
        />
        <input
          type="text"
          placeholder="New book author"
          value={newAuthor}
          onChange={(e) => setNewAuthor(e.target.value)}
          style={{ marginRight: "8px" }}
        />
        <button onClick={handleAddBook}>Add Book</button>
      </div>

      {/* Book List */}
      {filteredBooks.map((book, index) => (
        <div
          key={index}
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            border: "1px solid #ccc",
            borderRadius: "6px",
            padding: "8px",
            marginBottom: "8px",
          }}
        >
          <span>
            <strong>{book.title}</strong> by {book.author}
          </span>
          <button onClick={() => handleRemoveBook(index)}>Remove</button>
        </div>
      ))}
    </div>
  );
};

export default LibraryManagement;
