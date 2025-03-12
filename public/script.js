const API_URL = 'http://localhost:3000/notes';

async function fetchNotes() {
    const search = document.getElementById('search').value;
    const category = document.getElementById('filterCategory').value;
    let url = API_URL + '?';
    if (category) url += `category=${category}&`;
    if (search) url += `search=${search}`;

    const response = await fetch(url);
    const notes = await response.json();
    renderNotes(notes);
}

function renderNotes(notes) {
    const notesDiv = document.getElementById('notes');
    notesDiv.innerHTML = '';
    notes.forEach(note => {
        const div = document.createElement('div');
        div.className = 'note';
        div.innerHTML = `<strong>${note.category}</strong>: ${note.text} 
            <button onclick="deleteNote(${note.id})">🗑️</button>`;
        notesDiv.appendChild(div);
    });
}

async function addNote() {
    const category = document.getElementById('category').value;
    const text = document.getElementById('text').value;
    if (!text) return alert('Zadej text!');

    await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category, text })
    });

    document.getElementById('text').value = '';
    fetchNotes();
}

async function deleteNote(id) {
    await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
    fetchNotes();
}

fetchNotes();
