
import './App.css';
import {BrowserRouter, Routes, Route} from 'react-router-dom';
import InstructorDashboard from './components/instructorDashboard';
import Navbar from './components/navbar';
import StudentDashboard from './components/studentDashboard';
import Register from './components/signup';
import Spinner from './components/spinner';
import Login from './components/login';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
      <Navbar/>
      <Routes>
{/*                <Route exact path="/" element = {<Spinner/>}/>
 */}
         <Route exact path="/" element={<Login/>}/>
         <Route exact path="/register" element = {<Register/>}/>
          <Route path="/instructorDashboard" element = {<InstructorDashboard/>}/>
         <Route path ="/studentDashboard" element = {<StudentDashboard/>}/>
                  

      </Routes>

      </BrowserRouter>
    
    </div>
  );
}

export default App;
