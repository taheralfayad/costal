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

  const handleTitleChange = (e) =>
    setForm((prev) => ({ ...prev, title: e.target.value }));
  const handleAuthorChange = (e) =>
    setForm((prev) => ({ ...prev, author: e.target.value }));
  const handleIsbnChange = (e) =>
    setForm((prev) => ({ ...prev, isbn: e.target.value }));
  const handleDateChange = (e) =>
    setForm((prev) => ({ ...prev, published_date: e.target.value }));
  const handleFileChange = (e) =>
    setForm((prev) => ({ ...prev, file: e.target.files[0] }));

  const handleAddTextbook = async (e) => {
    e.preventDefault();

    console.log("Submitting form data", form);

    const formData = new FormData();
    formData.append("title", form.title);
    formData.append("author", form.author);
    formData.append("isbn", form.isbn);
    formData.append("published_date", form.published_date);
    if (form.file) {
      const fileBlob = new Blob([form.file], { type: form.file.type });
      formData.append("file", fileBlob, form.file.name);
    }


    formData.append("course", COURSE_ID);

    const response = await fetch("/lti/api/textbooks/", {
      method: "POST",
      body: formData,
    });
    if (response.ok) {
      const newBook = await response.json();
      setTextbooks([...textbooks, newBook]);
      setForm({ title: '', author: '', isbn: '', published_date: '', file: null });
    } else {
      const err = await response.json();
      console.error("Failed to add textbook", err);
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
    <main className='p-6 pl-10'>
      <Title>Manage Textbooks</Title>


      <form onSubmit={handleAddTextbook}>
        <section className='flex justify-between'>
          <section className='w-1/2 flex flex-col gap-4 pt-2'>
            <Input value={form.title} onChange={handleTitleChange} label="Title" />
            <Input value={form.author} onChange={handleAuthorChange} label="Author" />
            <Input value={form.isbn} onChange={handleIsbnChange} label="ISBN" />
            <Input type="date" value={form.published_date} onChange={handleDateChange} label="Published Date" />
            <input type="file" onChange={handleFileChange} />

          </section>
          <aside className='w-2/5 border border-slate-300 rounded-lg shadow-sm p-4 m-6' >
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
          </aside>
        </section>


        <section className='flex justify-end gap-2 pr-4 pb-2 pt-12'>
          <Button label='Save' form={true} />
          <Button label='Cancel' type='outline' onClick={() => navigate('/lti/course_outline')} />
        </section>
      </form>
    </main >
  );
};

export default ManageTextbooks;
