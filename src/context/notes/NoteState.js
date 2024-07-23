import { useState } from "react";
import NoteContext from "./noteContext";

const NoteState = (props) => {
    const host = process.env.REACT_APP_BACKEND_HOSTING_DOMAIN;

    const initialNotes = []

    const [notes, setNotes] = useState(initialNotes)

    // Get all notes
    const getNotes = async () => {
        const url = `${host}/api/notes/fetchallnotes`;
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'auth-token': localStorage.getItem('token')
            }
        });

        const json = await response.json();
        // console.log(json)
        setNotes(json)
    }

    // add a note
    const addNote = async (title, description, tag) => {
        const url = `${host}/api/notes/addnote`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'auth-token': localStorage.getItem('token')
            },
            body: JSON.stringify({ title, description, tag })
        });

        const note = await response.json();
        setNotes(notes.concat(note))
    }

    // delete a note
    const deleteNote = async (id) => {
        const url = `${host}/api/notes/deletenote/${id}`;
        const response = await fetch(url, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'auth-token': localStorage.getItem('token')
            }
        });

        // eslint-disable-next-line
        const json = await response.json();
        // console.log(json)

        const newNotes = notes.filter((note) => { return note._id !== id })
        setNotes(newNotes)
    }

    // edit a note
    const editNote = async (id, title, description, tag) => {
        const url = `${host}/api/notes/updatenote/${id}`;
        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'auth-token': localStorage.getItem('token')
            },
            body: JSON.stringify({ title, description, tag })
        });

        // eslint-disable-next-line
        const json = await response.json();

        // logic to edit note in client
        let newNotes = JSON.parse(JSON.stringify(notes))
        // let newNotes = [...notes]
        for (let index = 0; index < newNotes.length; index++) {
            if (newNotes[index]._id === id) {
                newNotes[index].title = title;
                newNotes[index].description = description;
                newNotes[index].tag = tag;
                break;
            }
        }
        setNotes(newNotes)
    }

    return (
        <NoteContext.Provider value={{ notes, getNotes, addNote, deleteNote, editNote }}>
            {props.children}
        </NoteContext.Provider>
    )
}

export default NoteState;