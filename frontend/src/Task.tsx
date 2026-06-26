interface Task {
  id : number,
  content : string,
  created_at : Date, 
}

interface TaskComponentProps {
    task : Task,
    handleDelete : (id : number) => void
    handleEdit : (id : number) => void
    isEditing?: boolean
    editContent?: string
    onEditContentChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
    handleSaveEdit?: () => void
}
export default function Task({task, handleDelete, handleEdit, isEditing, editContent, onEditContentChange, handleSaveEdit} : TaskComponentProps) {
    return <div className="single-task-container">
        {isEditing ? (
            <input type="text" value={editContent} onChange={onEditContentChange} autoFocus />
        ) : (
            <p>{task.content}</p>
        )}
        {isEditing ? (
            <button onClick={handleSaveEdit}>✓</button>
        ) : (
            <button onClick={(_) => {handleEdit(task.id)}}>Edit</button>
        )}
        <button onClick={(_) => {handleDelete(task.id)}}>Delete</button>
    </div>
}