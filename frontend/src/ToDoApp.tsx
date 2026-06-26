import React, { useEffect, useState } from "react";
import Task from "./Task";
import type { Session } from "@chromia/ft4";

interface Task {
  id : number,
  content : string,
  created_at : Date, 
}

async function addTask(content : string, session: Session): Promise<Task> {
  // Use the session to do the operation
  const result = await session.call({
    name: "create_task",
    args: [content]
  });

  if (result.receipt.status === "confirmed") {
    console.log("Task created successsfully!");

    // get the new task to add to the list 
    const res = await session.client.query("get_latest_task", {account_id : session.account.id}) as unknown as any;
    const t : Task = {id: Number(res.id), content: res.content, created_at: new Date(Number(res.created_at))};
    console.log("Added a new task : " + t.content);
    return t;
  }

  throw new Error("Error when creating task!");
}

async function getTasks(session: Session): Promise<Task[]> {
  const result = await session.client.query(
    "get_all_tasks",
    { account_id: session.account.id }  // pass account id from session
  ) as unknown as any[];

  return result.map((raw) => ({
    id: Number(raw.id),
    content: raw.content,
    created_at: new Date(Number(raw.created_at)),
  }));
}

async function deleteTask(id: number, session: Session) {
  const result = await session.call({
    name: "delete_task",
    args: [id] 
  });

  if (result.receipt.status === "confirmed") {
    console.log("Task deleted successfully!");
    return;
  }

  throw new Error("Error when deleting task with id : " + id);
}

interface ToDoAppProps {
    session : Session,
    handleDisconnect : (e: React.MouseEvent<HTMLButtonElement>) => void;
}

function ToDoApp( {session, handleDisconnect} : ToDoAppProps ) {
  const [input, setInput] = useState("");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState<string>("");

  useEffect(() => {
    getTasks(session)
      .then(setTasks)
      .catch(console.error);
  }, []);
  
  const handleInputChange = (e : React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    setInput(value);
  }

  const handleAdd = async  (_ : React.MouseEvent<HTMLButtonElement>) => {
    try {
      const newTask: Task = await addTask(input, session)
      // Reset the input after adding the task
      setInput("");
      setTasks(prev => [...prev, newTask]);
    } catch (e) {
      console.log(e);
    }

  }

  const handleDelete = async (id : number) => {
    try {
      await deleteTask(id, session);
      // delete the task from ui
      setTasks(prev => prev.filter((t : Task) => t.id != id));
    } catch (e) {
      console.log(e);
    }
  }

  const handleEdit = (id : number) => {
    const taskToEdit = tasks.find(t => t.id === id);
    if (taskToEdit) {
      setEditingTaskId(id);
      setEditContent(taskToEdit.content);
    }
  }

  const handleSaveEdit = async (id: number) => {
    try {
      try {
        await session.call({
          name: "update_task",
          args: [id, editContent]
        });
      } catch (err) {
        console.log("Backend update failed, updating locally", err);
      }
      setTasks(prev => prev.map(t => t.id === id ? { ...t, content: editContent } : t));
      setEditingTaskId(null);
      setEditContent("");
    } catch (e) {
      console.log(e);
    }
  }

  return <div className="todo-app-container">
    <h1>To do App</h1>
    <div className="input-container">
      <input type="text" placeholder="watch world cup . . ." value={input} onChange={handleInputChange}/>
      <button onClick={handleAdd}>+</button>
    </div>

    <div className="tasks-container">
      <ul>
        {tasks.map((t : Task) => { 
          return <Task 
            handleDelete={handleDelete} 
            handleEdit={handleEdit} 
            task={t} 
            key={t.id}
            isEditing={editingTaskId === t.id}
            editContent={editContent}
            onEditContentChange={(e) => setEditContent(e.target.value)}
            handleSaveEdit={() => handleSaveEdit(t.id)}
          />
        })}
      </ul>
    </div>
    <button onClick={handleDisconnect}>Disconnect</button>
  </div>;
}

export default ToDoApp;