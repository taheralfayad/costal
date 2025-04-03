import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Input, Title } from '../../design-system';

const ManageTextbooks = () => {
  const [textbooks, setTextbooks] = useState([]);
  const [form, setForm] = useState({
    title: '',
    author: '',
    isbn: '',
    published_date: '',
    file: null
  });

  const navigate = useNavigate();

  useEffect(() => {
    fetch(`/lti/api/textbooks/course/${COURSE_ID}/`)
      .then(res => res.json())
      .then(setTextbooks)
      .catch(err => console.error("Error fetching textbooks:", err));
  }, []);

  const handleChange = (e) => {
    if (e.target.name === "file") {
      setForm({ ...form, file: e.target.files[0] });
    } else {
      setForm({ ...form, [e.target.name]: e.target.value });
    }
  };

  const handleAddTextbook = async () => {
    const formData = new FormData();
    formData.append("title", form.title);
    formData.append("author", form.author);
    formData.append("isbn", form.isbn);
    formData.append("published_date", form.published_date);
    formData.append("file", form.file);
    formData.append("course", COURSE_ID);

    const response = await fetch("/lti/api/textbooks/", {
      method: "POST",
      body: formData
    });

    if (response.ok) {
      const newBook = await response.json();
      setTextbooks([...textbooks, newBook]);
      setForm({ title: '', author: '', isbn: '', published_date: '', file: null });
    } else {
      console.error("Failed to add textbook");
    }
  };

  const handleDelete = async (id) => {
    const res = await fetch(`/lti/api/textbooks/${id}/`, { method: "DELETE" });
    if (res.status === 204) {
      setTextbooks(textbooks.filter(book => book.id !== id));
    } else {
      console.error("Failed to delete textbook");
    }
  };

  return (
    <main className="p-8 space-y-6">
      <Title>Manage Textbooks</Title>

      <section className="bg-white p-4 rounded-lg shadow-md border max-w-xl space-y-4">
        <h2 className="text-lg font-semibold">Add New Textbook</h2>
        <Input name="title" value={form.title} onChange={handleChange} label="Title" />
        <Input name="author" value={form.author} onChange={handleChange} label="Author" />
        <Input name="isbn" value={form.isbn} onChange={handleChange} label="ISBN" />
        <Input name="published_date" type="date" value={form.published_date} onChange={handleChange} label="Published Date" />
        <input type="file" name="file" onChange={handleChange} />
        <Button label="Add Textbook" onClick={handleAddTextbook} />
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Current Textbooks</h2>
        {textbooks.map(book => (
          <div key={book.id} className="flex justify-between items-center bg-gray-100 p-4 rounded">
            <div>
              <p className="font-bold">{book.title}</p>
              <p className="text-sm text-gray-600">by {book.author} — ISBN: {book.isbn}</p>
            </div>
            <Button label="Delete" type="outline" onClick={() => handleDelete(book.id)} />
          </div>
        ))}
      </section>

      <Button label="Back to Course" onClick={() => navigate('/lti/course_outline')} />
    </main>
  );
};

export default ManageTextbooks;
