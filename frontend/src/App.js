
import './App.css';
import {BrowserRouter, Routes, Route} from 'react-router-dom';
import InstructorDashboard from './components/instructorDashboard';
import Navbar from './components/navbar';
import StudentDashboard from './components/studentDashboard';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
      <Navbar/>
      <Routes>
        <Route exact path="/" element = {<InstructorDashboard/>}/>
        <Route path ="studentDashBoard" element = {<StudentDashboard/>}/>
                  

      </Routes>

      </BrowserRouter>
    
    </div>
  );
}

export default App;
