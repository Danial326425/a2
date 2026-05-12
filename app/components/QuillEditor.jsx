'use client';

import React, { forwardRef, useEffect, useRef } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

const QuillEditor = forwardRef(({ value, onChange, style, theme = 'snow', ...props }, ref) => {
  const quillRef = useRef(null);

  useEffect(() => {
    if (ref && quillRef.current) {
      const editor = quillRef.current.getEditor?.();
      if (typeof ref === 'function') {
        ref(editor);
      } else if (ref?.current !== undefined) {
        ref.current = editor;
      }
    }
  }, [ref]);

  return (
    <ReactQuill
      ref={quillRef}
      value={value}
      onChange={onChange}
      style={style}
      theme={theme}
      {...props}
    />
  );
});

QuillEditor.displayName = 'QuillEditor';

export default QuillEditor;