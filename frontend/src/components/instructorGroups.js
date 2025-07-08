// InstructorGroups.jsx
import { useState } from 'react';
import styles from './instructorGroups.module.css';

// Mock data — replace with API calls as needed
const mockGroups = [
  { id: 1, name: 'Group A', students: ['Alice Johnson', 'Bob Smith', 'Charlie Lee'] },
  { id: 2, name: 'Group B', students: ['David Kim', 'Ella Green'] }
];

// Master student list
const mockStudents = [
  'Alice Johnson', 'Bob Smith', 'Charlie Lee',
  'David Kim', 'Ella Green', 'Fiona Chen',
  'George Patel', 'Hannah Lee'
];

const InstructorGroups = () => {
  const [groups, setGroups] = useState(mockGroups);
  const [newGroupName, setNewGroupName] = useState('');
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [studentSearchTerm, setStudentSearchTerm] = useState('');

  const handleAddGroup = () => {
    const name = newGroupName.trim();
    if (!name) return;
    setGroups(prev => [...prev, { id: Date.now(), name, students: [] }]);
    setNewGroupName('');
  };

  const handleRemoveGroup = (groupId) => {
    setGroups(prev => prev.filter(g => g.id !== groupId));
    if (selectedGroupId === groupId) {
      setSelectedGroupId(null);
    }
  };

  const handleRemoveStudent = (groupId, student) => {
    setGroups(prev => prev.map(g =>
      g.id === groupId ? { ...g, students: g.students.filter(s => s !== student) } : g
    ));
  };

  const handleAddStudent = (groupId, student) => {
    setGroups(prev => prev.map(g =>
      g.id === groupId && !g.students.includes(student)
        ? { ...g, students: [...g.students, student] }
        : g
    ));
    setStudentSearchTerm('');
  };

  const filteredGroupStudents = (group) =>
    group.students.filter(s => s.toLowerCase().includes(searchTerm.toLowerCase()));

  const filteredMasterStudents = () =>
    mockStudents
      .filter(s => !groups.find(g => g.id === selectedGroupId)?.students.includes(s))
      .filter(s => s.toLowerCase().includes(studentSearchTerm.toLowerCase()));

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Group Management</h2>

      <div className={styles.controls}>
        <input
          className={styles.input}
          type="text"
          placeholder="New group name"
          value={newGroupName}
          onChange={e => setNewGroupName(e.target.value)}
        />
        <button className={styles.button} onClick={handleAddGroup}>Add Group</button>
      </div>

      <div className={styles.searchBox}>
        <input
          className={styles.input}
          type="text"
          placeholder="Search students in all groups"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      {groups.map(group => (
        <div
          key={group.id}
          className={`${styles.groupCard} ${selectedGroupId === group.id ? styles.selected : ''}`}
          onClick={() => setSelectedGroupId(group.id)}
        >
          <div className={styles.header}>
            <h3 className={styles.groupName}>{group.name}</h3>
            <button
              className={styles.removeGroupBtn}
              onClick={e => { e.stopPropagation(); handleRemoveGroup(group.id); }}
            >
              ×
            </button>
          </div>

          <ul className={styles.studentList}>
            {filteredGroupStudents(group).map(student => (
              <li key={student} className={styles.studentItem}>
                {student}
                <button
                  className={styles.removeBtn}
                  onClick={e => { e.stopPropagation(); handleRemoveStudent(group.id, student); }}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>

          {selectedGroupId === group.id && (
            <div className={styles.addStudentBox}>
              <input
                className={styles.input}
                type="text"
                placeholder="Search existing students to add"
                value={studentSearchTerm}
                onChange={e => { e.stopPropagation(); setStudentSearchTerm(e.target.value); }}
              />
              {studentSearchTerm && (
                <ul className={styles.suggestionList}>
                  {filteredMasterStudents().map(student => (
                    <li
                      key={student}
                      className={styles.suggestionItem}
                      onClick={e => { e.stopPropagation(); handleAddStudent(group.id, student); }}
                    >
                      {student}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default InstructorGroups;

