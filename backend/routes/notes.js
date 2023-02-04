const express = require("express");
const router = express.Router();
const fetchuser = require("../middleware/fetchuser");
const Note = require("../models/Note");
const { body, validationResult } = require("express-validator");

//ROUTE #1  :: Fetching all the notes using GET: "/api/notes/fetchallnotes". Login required
router.get("/fetchallnotes", fetchuser, async (req, res) => {
  try {
    const notes = await Note.find({ user: req.user.id });
    res.json(notes);
  } catch (error) {
    console.error(err.message);
    res.status(500).send("Internal server error");
  }
});

//ROUTE #2  :: Add notes using POST: "/api/notes/addnote". Login required
router.post(
  "/addnote",
  fetchuser,
  [
    body("title", "Enter a valid title").isLength({ min: 3 }),
    body("description", "Descriptiom must be atleast 5 characters!").isLength({
      min: 5,
    }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    //If there are error then return Bad Request along with the errors.
    if (!errors.isEmpty()) {
      console.log({ errors });
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { title, description, tag } = req.body;
      const note = new Note({
        title,
        description,
        tag,
        user: req.user.id,
      });
      const savedNote = await note.save();

      res.json(savedNote);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Internal server error");
    }
  }
);

//ROUTE #3  :: Updating existing notes using PUT: "/api/notes/updatenote". Login required
router.put(
  "/updatenote/:id",
  fetchuser,
  async (req, res) => {
    const errors = validationResult(req);
    //If there are error then return Bad Request along with the errors.
    if (!errors.isEmpty()) {
      console.log({ errors });
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { title, description, tag } = req.body;

      //Creating a new Note object
      const newNote = {}
      if(title){
        newNote.title = title;
      }
      if(description){
        newNote.description = description;
      }
      if(tag){
        newNote.tag = tag;
      }

      //Finding the note to be updated and then updating it
      var note = await Note.findById(req.params.id);
      if(!note){
        return res.status(404).send("Note not found");
      }
      
      if(note.user.toString() !== req.user.id){
        return res.status(401).send("Action not allowed");
      }

      note = await Note.findByIdAndUpdate(req.params.id, {$set: newNote}, {new: true});
      res.json(note);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Internal server error");
    }
  }
); 

//ROUTE #4  :: Deleting existing notes using DELETE: "/api/notes/deletenote". Login required
router.delete(
  "/deletenote/:id",
  fetchuser,
  async (req, res) => {
    const errors = validationResult(req);
    //If there are error then return Bad Request along with the errors.
    if (!errors.isEmpty()) {
      console.log({ errors });
      return res.status(400).json({ errors: errors.array() });
    }

    try {

      //Finding the note to be deleted and then deleting it
      var note = await Note.findById(req.params.id);
      if(!note){
        return res.status(404).send("Note not found");
      }
      
      //If the user is trying to delete other user's note
      if(note.user.toString() !== req.user.id){
        return res.status(401).send("Action not allowed");
      }

      note = await Note.findByIdAndDelete(req.params.id);
      res.json({"Success": "Note has been deleted!", note});
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Internal server error");
    }
  }
); 
module.exports = router;
