import React from 'react';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/material.css';
import 'codemirror/mode/scheme/scheme';
import { Controlled as ControlledEditor } from 'react-codemirror2';

type Props = {
  displayName : string,
  value: string,
  onChange: React.Dispatch<React.SetStateAction<string>>,
};

const Editor = ({
  displayName,
  value,
  onChange,
}: Props) => {
  const handleChange = (editor: string, data: string, value: string) => {
    onChange(value);
  }

  return (
    <div className="editor-container">
      <div className="editor-title">
        {displayName}
        <button>O/C</button>
      </div>
      <ControlledEditor
        onBeforeChange={handleChange}
        value={value}
        className="code-mirror-wrapper definitions"
        options={{
          lineWrapping: true,
          lint: true,
          mode: 'scheme',
          theme: 'material',
          lineNumbers: true,
        }}
      />
    </div>
  );
};

export default Editor;
