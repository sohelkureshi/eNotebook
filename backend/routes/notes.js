const express = require('express');
const Note = require('../models/Note');
const router = express.Router();
const fetchuser = require('../middleware/fetchuser');
const { body, validationResult } = require('express-validator');

// ROUTE 1: Get all the notes using: GET "/api/notes/fetchallnotes". Login required
router.get('/fetchallnotes', fetchuser, async (req, res) => {
    try {
        const notes = await Note.find({ user: req.user.id });
        res.json(notes)
    }
    catch (error) {
        console.error(error.message);
        res.status(500).send("Internal server error");
    }
})

// ROUTE 2: Add a new note using: POST "/api/notes/addnote". Login required
router.post('/addnote', fetchuser,
    [
        body('title', 'Enter a valid title').isLength({ min: 3 }),
        body('description', 'Description must be atleast 5 characters').isLength({ min: 5 })
    ],
    async (req, res) => {
        // if there are errors while validation of user inputs, return bad request and the errors
        const result = validationResult(req);
        if (!result.isEmpty()) {
            return res.status(400).json({ errors: result.array() });
        }

        try {
            const { title, description, tag } = req.body;
            const note = new Note({
                title,
                description,
                tag,
                user: req.user.id
            })
            const savedData = await note.save();
            res.json(savedData)
        }
        catch (error) {
            console.error(error.message);
            res.status(500).send("Internal server error");
        }
    }
)

// ROUTE 3: Update an existing note using: PUT "/api/notes/updatenote". Login required
router.put('/updatenote/:id', fetchuser,
    // [
    //     body('title', 'Enter a valid title').isLength({ min: 3 }),
    //     body('description', 'Description must be atleast 5 characters').isLength({ min: 5 })
    // ],
    async (req, res) => {
        try {
            const { title, description, tag } = req.body;

            // create a new note object
            const newNote = {};

            // update only those fields that are asked to
            if (title) { newNote.title = title };
            if (description) { newNote.description = description };
            if (tag) { newNote.tag = tag };

            // find the note to be updated and update it
            let note = await Note.findById(req.params.id);
            if (!note) { return res.status(404).send("Note not found") };

            // if the note doesn't belong to the user who is trying to access
            if (note.user.toString() !== req.user.id) {
                return res.status(401).send("Not allowed");
            }

            note = await Note.findByIdAndUpdate(req.params.id, { $set: newNote }, { new: true })
            res.json({note})
        }
        catch (error) {
            console.error(error.message);
            res.status(500).send("Internal server error");
        }
    }
)

// ROUTE 4: Delete an existing note using: DELETE "/api/notes/deletenote". Login required
router.delete('/deletenote/:id', fetchuser,
    // [
    //     body('title', 'Enter a valid title').isLength({ min: 3 }),
    //     body('description', 'Description must be atleast 5 characters').isLength({ min: 5 })
    // ],
    async (req, res) => {
        try {
            // find the note to be deleted and delete it
            let note = await Note.findById(req.params.id);
            if (!note) { return res.status(404).send("Note not found") };

            // Allow deletion only if user owns this note
            if (note.user.toString() !== req.user.id) {
                return res.status(401).send("Not allowed");
            }

            note = await Note.findByIdAndDelete(req.params.id)
            res.json({"Success": "Note has been deleted", note: note})
        }
        catch (error) {
            console.error(error.message);
            res.status(500).send("Internal server error");
        }
    }
)

module.exports = router;