// import './App.css';
// import BreweryList from './BreweryList';
// import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// const queryClient = new QueryClient();

// function App() {
//   return (
//     <div className="App">
//       <QueryClientProvider client={queryClient}>
//       <BreweryList />
//     </QueryClientProvider>
//     </div>
//   );
// }

// export default App;


import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import BreweryList from "./BreweryList";
import BreweryDetails from "./BreweryDetails";

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path="/" element={<BreweryList />} />
          <Route path="/brewery/:id" element={<BreweryDetails />} />
        </Routes>
      </Router>
    </QueryClientProvider>
  );
}
