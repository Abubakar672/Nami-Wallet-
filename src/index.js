import React from 'react';
import ReactDOM from 'react-dom';

import App from './App';

ReactDOM.render(
  <App />,
  document.getElementById('app')
);
//TO GET INSTANT RELOD OF DATA ON PAGE 
module.hot.accept();
