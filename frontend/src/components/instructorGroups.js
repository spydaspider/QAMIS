// InstructorGroups.jsx
import { useState, useEffect } from 'react';
import styles from './instructorGroups.module.css';
import { useGroupsContext } from '../hooks/useGroupsContext';
import { useAuthContext } from '../hooks/useAuthContext';

const InstructorGroups = () => {
  const { groups, dispatch } = useGroupsContext();
  console.log('current groups array:', groups);

  const { user } = useAuthContext();

  const [experiments, setExperiments] = useState([]);
  const [selectedExperimentId, setSelectedExperimentId] = useState('');
  const [newGroupName, setNewGroupName] = useState('');
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [studentSearchTerm, setStudentSearchTerm] = useState('');
  const [students, setStudents] = useState([]);
  const [error, setError] = useState(null);

  // fetch experiments
  useEffect(() => {
    const fetchExperiments = async () => {
      try {
        const res = await fetch('/api/experiments', { headers: { 'Authorization': `Bearer ${user.token}` } });
        const json = await res.json();
        if (res.ok) {
          setExperiments(json.data);
          if (json.data.length) setSelectedExperimentId(json.data[0]._id);
        } else setError(json.error);
      } catch {
        setError('Failed to fetch experiments');
      }
    };
    if (user) fetchExperiments();
  }, [user]);

  // fetch groups
   // fetch groups
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const res  = await fetch('/api/teams', { headers: { 'Authorization': `Bearer ${user.token}` } });
        const json = await res.json();
        console.log(json);
        if (res.ok) {
          dispatch({ type: 'SET_GROUPS', payload: json.data });
         if (json.data.length && !selectedGroupId) {
           setSelectedGroupId(json.data[0]._id);
         }
        } else {
          setError(json.error);
        }
      } catch {
        setError('Failed to fetch groups');
      }
    };
    if (user) fetchGroups();
  }, [dispatch, user]);


  // fetch users
 useEffect(() => {
  const fetchUsers = async () => {
    setError(null);                         // clear previous
    try {
      const res  = await fetch('/api/users/allUsers');
      const json = await res.json();
      // adjust to the real field name:
      const list = json;
      setStudents(list.filter(u => u.role === 'student'));
    } catch (err) {
      console.error(err);
      setError('Failed to fetch users');
    }
  };
  if (user) fetchUsers();
}, [user]);

  const handleAddGroup = async () => {
    const name = newGroupName.trim();
    if (!name || !selectedExperimentId) return setError('Group name or experiment missing');
    try {
      const res = await fetch('/api/teams', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({ name, experiment: selectedExperimentId, students: [] })
      });
      const json = await res.json();
      if (res.ok) {
        dispatch({ type: 'CREATE_GROUPS', payload: json.data });
        setNewGroupName('');
      } else setError(json.error);
    } catch {
      setError('Failed to create group');
    }
  };

  const handleRemoveGroup = async (groupId) => {
  console.log('[handleRemoveGroup] called with id:', groupId);

  try {
    const res = await fetch(`/api/teams/${groupId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${user.token}` }
    });
    console.log('[handleRemoveGroup] response.ok =', res.ok, 'status=', res.status);

    if (res.ok) {
      console.log('[handleRemoveGroup] about to dispatch DELETE_GROUPS');
      dispatch({ type: 'DELETE_GROUPS', payload: groupId });
      console.log('[handleRemoveGroup] dispatched DELETE_GROUPS');
      if (selectedGroupId === groupId) {
        setSelectedGroupId(null);
        console.log('[handleRemoveGroup] cleared selectedGroupId');
      }
    } else {
      const err = await res.json();
      console.error('[handleRemoveGroup] server error payload:', err);
      setError(err.error || 'Delete failed');
    }
  } catch (err) {
    console.error('[handleRemoveGroup] fetch threw:', err);
    setError('Failed to remove group');
  }
};


  const handleAddStudent = async (groupId, student) => {
    try {
      const res = await fetch(`/api/teams/${groupId}/assign-students`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({ studentIds: [student._id] })
      });
      const json = await res.json();
      if (res.ok) { dispatch({ type: 'UPDATE_GROUPS', payload: json.data }); setStudentSearchTerm(''); }
      else setError(json.error);
    } catch {
      setError('Failed to add student');
    }
  };

  const handleRemoveStudent = async (groupId, studentId) => {
    try {
      const res = await fetch(`/api/teams/${groupId}/remove-students`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({ studentIds: [studentId] })
      });
      const json = await res.json();
      if (res.ok) dispatch({ type: 'UPDATE_GROUPS', payload: json.data });
      else setError(json.error);
    } catch {
      setError('Failed to remove student');
    }
  };

  const filteredGroupStudents = (group) =>
    group.students
      .map(s => (typeof s === 'string' ? s : s.username))
      .filter(name => name.toLowerCase().includes(searchTerm.toLowerCase()));

  const filteredMasterStudents = () => {
    console.log('🔍 studentSearchTerm:', studentSearchTerm);
  console.log('👥 total students:', students.length);
  console.log('👥 student list:', students.map(s => s.username));
  // nothing to search yet
  if (!studentSearchTerm) return [];

  // find the selected group once
  const group = groups.find(g => g._id === selectedGroupId);
  // build a Set of student-IDs already in that group (handles strings & objects)
  const inGroupIds = new Set(
    (group?.students ?? []).map(st => (typeof st === 'string' ? st : st._id))
  );

  // return only those not inGroup AND matching the searchTerm
  return students
    .filter(s => !inGroupIds.has(s._id))
    .filter(s =>
      s.username.toLowerCase().includes(studentSearchTerm.toLowerCase())
    );
};
  return (
    <div className={styles.container}>
      {error && <div className={styles.error}>{error}</div>}
      <h2 className={styles.title}>Group Management</h2>

      <div className={styles.controls}>
        <input className={styles.input} placeholder="New group name" value={newGroupName} onChange={e => setNewGroupName(e.target.value)} />
        <select className={styles.select} value={selectedExperimentId} onChange={e => setSelectedExperimentId(e.target.value)}>
          {experiments.map(exp => (
            <option key={exp._id} value={exp._id}>
              {exp.title + ' (' + exp.methodology + ')'}
            </option>
          ))}
        </select>
        <button className={styles.button} onClick={handleAddGroup}>Add Group</button>
      </div>

      <div className={styles.searchBox}>
        <input className={styles.input} placeholder="Search students in all groups" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
      </div>

      {Array.isArray(groups) && groups.map(group => (
        <div key={group._id} className={`${styles.groupCard} ${selectedGroupId === group._id ? styles.selected : ''}`} onClick={() => setSelectedGroupId(group._id)}>
          <div className={styles.header}>
            <h3 className={styles.groupName}>{group.name}</h3>
            <span className={styles.experimentLabel}>
              {experiments.find(exp => exp._id === group.experiment)? experiments.find(exp => exp._id === group.experiment).title : 'No Exp'}
            </span>
            <button className={styles.removeGroupBtn} onClick={e => { e.stopPropagation(); handleRemoveGroup(group._id); }}>×</button>
          </div>

          <ul className={styles.studentList}>
            {filteredGroupStudents(group).map(studentName => (
              <li key={studentName} className={styles.studentItem}>
                {studentName}
                <button className={styles.removeBtn} onClick={e => { e.stopPropagation(); const st = group.students.find(st => (typeof st==='string'?st:st.username)===studentName); handleRemoveStudent(group._id, st._id); }}>Remove</button>
              </li>
            ))}
          </ul>

          {selectedGroupId && (
            <div className={styles.addStudentBox}>
              <input className={styles.input} placeholder="Search existing students to add" value={studentSearchTerm} onChange={e => setStudentSearchTerm(e.target.value)} />
              {studentSearchTerm && filteredMasterStudents().length > 0 && (
                <ul className={styles.suggestionList}>
                  {filteredMasterStudents().map(s => (
                    <li key={s._id} className={styles.suggestionItem} onClick={() => handleAddStudent(selectedGroupId, s)}>{s.username}</li>
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

