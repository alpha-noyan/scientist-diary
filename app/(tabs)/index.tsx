import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
} from "react-native";
import React, { useEffect, useState } from "react";
import { getDB } from "@/db/connection";

const Index = () => {
  // State variables for storing title and description
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [notes, setNotes] = useState([]);

  const [editSwitch, setEditSwitch] = useState(false);
  const [noteToBeEdit, setNoteToBeEdit] = useState(null);

  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");

  const fetchNotes = async () => {
    // sds
    const database = await getDB();
    try{
    const notes = await database.getAllAsync("SELECT * FROM notes");
    // console.log(notes);
    setNotes(notes);
    }
    catch(e){
      console.log(e)
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  // Function to add a new note
  const addNote = async () => {
    if (title.trim() === "" || description.trim() === "") {
      Alert.alert("Error", "Please fill in both title and description");
      return;
    }

    const newNote = {
      id: Date.now().toString(),
      title: title,
      description: description,
      dateTime: new Date().toLocaleString(),
    };

    const db = await getDB();
    try{
    await db.runAsync(
      `INSERT INTO notes (id,title,description,dateTime) VALUES (?,?,?,?)`,
      [newNote.id, newNote.title, newNote.description, newNote.dateTime],
    );} catch(e){
      console.log(e)
    }

    // setNotes([newNote, ...notes]);
    fetchNotes()
    setTitle("");
    setDescription("");
  };

  const del = async (id) => {
  const db = await getDB();

  await db.runAsync(
    `DELETE FROM notes WHERE id = ?`,
    [id]
  );

  await fetchNotes(); // keep DB as source of truth
};

  // Function to delete a note
  const deleteNote = (id) => {
    Alert.alert("Delete Note", "Are you sure you want to delete this note?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        onPress: () => del(id),
        style: "destructive",
      },
    ]);
    setEditSwitch(false);
    setEditTitle("");
    setEditDescription("");
  };

  // Function to edit a note
  const editNote = (note) => {
    setEditTitle(note.title);
    setEditDescription(note.description);
    setEditSwitch(!editSwitch);
    setNoteToBeEdit(note.id);
  };

  const applyEdit = async () => {
    const db = await getDB();
    try{
    await db.runAsync(
      `UPDATE notes
      SET title = ?, description = ?, dateTime = ?
      WHERE id = ?`,
      [editTitle, editDescription, new Date().toLocaleString(), noteToBeEdit],
    );} catch (e){
      console.log(e)
    }
    setNotes((prevNotes) => {
      const updated = prevNotes.map((it) =>
        it.id === noteToBeEdit
          ? {
              ...it,
              title: editTitle,
              description: editDescription,
              dateTime: new Date().toLocaleString(),
            }
          : it,
      );

      return updated;
    });
    setEditDescription("");
    setEditTitle("");
    setEditSwitch(false);
  };

  const cancelEdit = () => {
    setEditDescription("");
    setEditTitle("");
    setEditSwitch(false);
    setNoteToBeEdit(null);
  };

  // Render each note item
  const renderNoteItem = ({ item, idx }) => (
    <View style={styles.noteCard}>
      <View style={styles.noteHeader}>
        <Text style={styles.noteTitle}>{item.title}</Text>
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => editNote(item, idx)}
          >
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => deleteNote(item.id)}
          >
            <Text style={styles.deleteButtonText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
      <Text style={styles.noteDateTime}>{item.dateTime}</Text>
      <Text style={styles.noteDescription}>{item.description}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Scientist's Notes</Text>
      </View>

      {editSwitch ? (
        <View style={styles.inputSection}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Title</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter title..."
              placeholderTextColor="#999"
              value={editTitle}
              onChangeText={setEditTitle}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Enter description..."
              placeholderTextColor="#999"
              multiline
              numberOfLines={3}
              value={editDescription}
              onChangeText={setEditDescription}
            />
          </View>

          <View
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "center",
              gap: "20",
            }}
          >
            <TouchableOpacity style={styles.editButtonnn} onPress={cancelEdit}>
              <Text style={styles.addButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.editButtonn} onPress={applyEdit}>
              <Text style={styles.addButtonText}>Edit Note</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.inputSection}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Title</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter title..."
              placeholderTextColor="#999"
              value={title}
              onChangeText={setTitle}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Enter description..."
              placeholderTextColor="#999"
              multiline
              numberOfLines={3}
              value={description}
              onChangeText={setDescription}
            />
          </View>

          <TouchableOpacity style={styles.addButton} onPress={addNote}>
            <Text style={styles.addButtonText}>Add Note</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Notes List Section */}
      <View style={styles.notesSection}>
        <Text style={styles.sectionTitle}>Your Notes ({notes.length})</Text>

        {notes.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No notes yet</Text>
            <Text style={styles.emptyStateSubtext}>
              Add your first note above
            </Text>
          </View>
        ) : (
          <FlatList
            data={notes}
            renderItem={renderNoteItem}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.notesList}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    backgroundColor: "#fff",
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
  },
  inputSection: {
    backgroundColor: "#fff",
    margin: 20,
    padding: 20,
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#555",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: "#333",
    backgroundColor: "#fafafa",
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  addButton: {
    backgroundColor: "#4ca9c5",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  editButtonn: {
    backgroundColor: "#0d4682",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
    width: 100,
  },
  editButtonnn: {
    backgroundColor: "#7a838d",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
    width: 100,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  notesSection: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
  },
  notesList: {
    paddingBottom: 20,
  },
  noteCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  noteHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  noteTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    flex: 1,
  },
  actionButtons: {
    flexDirection: "row",
  },
  editButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#34C759",
    borderRadius: 6,
    marginLeft: 8,
  },
  editButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  deleteButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#FF3B30",
    borderRadius: 6,
    marginLeft: 8,
  },
  deleteButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  noteDateTime: {
    fontSize: 12,
    color: "#999",
    marginBottom: 10,
  },
  noteDescription: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 18,
    color: "#999",
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: "#bbb",
  },
});

export default Index;
