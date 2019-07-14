import React, { Component } from 'react';
import { BrowserRouter as Router, Route } from "react-router-dom";
import Header from './components/Header';
import Home from './components/Home'
import 'antd/dist/antd.css';

class App extends Component {
  
  render() {
    return (
      <Router basename="/">
        <div>
          <Header />
          <Route path="/" component={Home} />
        </div>
      </Router>
    );
  }
  
}

export default App;
