import Main from "./components/Main/Main";
import Sidebar from "./components/Sidebar/Sidebar";

const App = () => {
  return (
    <div className="app-layout">
      <Sidebar />
      <Main />
    </div>
  );
};

export default App;
