import React, { useState } from 'react';
import Editor from './Editor/Editor';
import { print } from '../evaluator/print';

const App = () => {
  const [definitions, setDefinitions] = useState('');
  const [evaluations, setEvaluations] = useState('');

  return (
    <div className="top">
      <Editor
        displayName='definitions'
        value={definitions}
        onChange={setDefinitions}
        // position={'left'}
      />
      <Editor
        displayName='evaluations'
        value={print(definitions)}
        onChange={(setEvaluations)}
        // position={'right'}
      />
    </div>
  );
};

export default App;
