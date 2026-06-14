'use client';

import React, { forwardRef, useRef, useMemo } from 'react';
import ReactQuill, { Quill } from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

// ফন্ট সাইজের তালিকা — ড্রপডাউনে এগুলো থেকে বেছে লেখা বড়/ছোট করা যাবে।
const SIZE_WHITELIST = ['12px', '14px', '16px', '18px', '20px', '24px', '28px', '32px', '40px', '48px'];

// অ্যালাইনমেন্ট ও ফন্ট-সাইজকে CSS class (ql-align-*/ql-size-*) এর বদলে ইনলাইন
// style="text-align:…" / style="font-size:…" হিসেবে সেভ করায়, যাতে স্টোরফ্রন্টে
// (যেখানে quill.snow.css লোড নেই) সেন্টার/রাইট ও ছোট/বড় সাইজ ঠিকভাবে দেখায়।
// এটি কম্পোনেন্ট রেন্ডারের সময় একবারই চলে — মডিউল-লোড অর্ডারের উপর নির্ভর না করে
// নিশ্চিত করে যে Quill ইনস্ট্যান্স তৈরির আগেই ফরম্যাটগুলো রেজিস্টার্ড থাকে।
let inlineStylesRegistered = false;
function registerInlineStyleFormats() {
  if (inlineStylesRegistered || typeof window === 'undefined' || !Quill) return;
  inlineStylesRegistered = true;
  try {
    Quill.register(Quill.import('attributors/style/align'), true);
    const SizeStyle = Quill.import('attributors/style/size');
    SizeStyle.whitelist = SIZE_WHITELIST;
    Quill.register(SizeStyle, true);
  } catch {
    inlineStylesRegistered = false; // পরের রেন্ডারে আবার চেষ্টা করার সুযোগ রাখি
  }
}

// সুন্দর ফরম্যাটিং টুলবার — হেডিং, বোল্ড/ইটালিক, কালার ও ব্যাকগ্রাউন্ড,
// অ্যালাইনমেন্ট, লিস্ট, কোট, লিংক/ইমেজ ইত্যাদি। কোনো caller আলাদা `modules`
// না দিলে এটিই ডিফল্ট হিসেবে ব্যবহৃত হয়।
const DEFAULT_MODULES = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    [{ size: [false, ...SIZE_WHITELIST] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ color: [] }, { background: [] }],
    [{ list: 'ordered' }, { list: 'bullet' }],
    [{ align: [] }],
    ['blockquote'],
    ['link', 'image'],
    ['clean'],
  ],
  // matchVisual: false রাখলে বাইরে থেকে (ওয়েবসাইট/ইমোজি/আইকন) কপি-পেস্ট করা
  // কন্টেন্ট Quill নিজের মতো করে পরিষ্কার করে নেয়, ফলে অপ্রত্যাশিত মার্কআপের
  // কারণে এডিটর ভেঙে পড়ে না বা এরর দেখায় না।
  clipboard: { matchVisual: false },
};

const DEFAULT_FORMATS = [
  'header',
  'size',
  'bold', 'italic', 'underline', 'strike',
  'color', 'background',
  'list',
  'align',
  'blockquote',
  'link', 'image',
];

const QuillEditor = forwardRef(({ value, onChange, style, theme = 'snow', modules, formats, ...props }, ref) => {
  const quillRef = useRef(null);

  // ReactQuill (child) মাউন্ট হওয়ার আগেই ইনলাইন-স্টাইল ফরম্যাট রেজিস্টার নিশ্চিত করি।
  registerInlineStyleFormats();

  // caller modules দিলে সেটাই, না দিলে রিচ ডিফল্ট। formats-ও তেমন।
  const resolvedModules = useMemo(() => modules || DEFAULT_MODULES, [modules]);
  const resolvedFormats = useMemo(() => formats || (modules ? undefined : DEFAULT_FORMATS), [formats, modules]);

  const setRefs = (instance) => {
    quillRef.current = instance;
    if (!ref) return;
    const editor = instance?.getEditor?.() ?? instance;
    if (typeof ref === 'function') ref(editor);
    else if (ref?.current !== undefined) ref.current = editor;
  };

  return (
    <ReactQuill
      ref={setRefs}
      value={value || ''}
      onChange={onChange}
      style={style}
      theme={theme}
      modules={resolvedModules}
      formats={resolvedFormats}
      {...props}
    />
  );
});

QuillEditor.displayName = 'QuillEditor';

export default QuillEditor;
