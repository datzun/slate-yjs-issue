import React, { useEffect, useMemo, useState } from 'react';
import { Editor, createEditor } from 'slate';
import { Editable, Slate, withReact } from 'slate-react';
import * as Y from 'yjs';
import { HocuspocusProvider } from '@hocuspocus/provider';
import { withYjs, YjsEditor } from '@slate-yjs/core';

const Element = ({ attributes, children, element }) => {
  switch (element.type) {
      default:
          return <p {...attributes}>{children}</p>;
  }
};

const Leaf = ({ attributes, children, leaf }) => {
  if (leaf.bold)
    children = <strong>{children}</strong>;

  return <span {...attributes}>{children}</span>;
};

const toggleMark = (editor, format) => {
  const isActive = isMarkActive(editor, format);

  if (isActive) Editor.removeMark(editor, format);
  else Editor.addMark(editor, format, true);
};

const isMarkActive = (editor, format) => {
  const marks = Editor.marks(editor);
  return marks ? marks[format] === true : false;
};

const MarkButton = ({ editor, format }) => (
    <button
        onMouseDown={event => {
            event.preventDefault();
            toggleMark(editor, format);
        }}
    >Bold</button>
);

const App = () => {
  const [value, setValue] = useState([]);
  const provider = useMemo(
    () =>
      new HocuspocusProvider({
        url: 'ws://127.0.0.1:1234',
        name: 'slate-yjs-demo'
      }),
    []
  );
  const editor = useMemo(
      () => {
        const sharedType = provider.document.get('content', Y.XmlText);
        return withReact(withYjs(createEditor(), sharedType));
      },
      [provider.document]
  );

  // Disconnect YjsEditor on unmount in order to free up resources
  useEffect(() => () => YjsEditor.disconnect(editor), [editor]);
  useEffect(() => () => provider.disconnect(), [provider]);

  return (
    <Slate editor={editor} onChange={setValue} value={value}>
      <MarkButton editor={editor} format="bold" icon="bold" />
      <Editable
          placeholder="Enter some rich text…"
          renderElement={Element}
          renderLeaf={Leaf}
      />
    </Slate>
  );
};

export default App;
