import React, {useState, useEffect} from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import 'katex/dist/katex.min.css'
import ReactDOM from 'react-dom';

import './TextEditor.css';

function TextEditor(props) {
    const [content, setContent] = useState('');
    // Selection of the text inside the ContentEditable
    const [range, setRange] = useState(null);

    function handleContentChange(e) {
        setContent(e.target.value);
    }

    function restoreSelection() {
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
        return selection;
    }

    function handleTextareaMouseUp() {
        setRange(window.getSelection().getRangeAt(0));
    }

    function wrapText(openTag, closeTag) {
        var textArea = document.getElementById("markdown-textarea");
        var len = textArea.value.length;
        var start = textArea.selectionStart;
        var end = textArea.selectionEnd;
        var selectedText = textArea.value.substring(start, end);
        var replacement = openTag + selectedText + closeTag;
        let new_content = textArea.value.substring(0, start) + replacement + textArea.value.substring(end, len);
        setContent(new_content);
    }

    function handleBoldIconClick() {
        wrapText("**", "**");
    }

    return (
        <div className="form-group">
            <div>{ props.label }</div>
            <div className="markdown-control-panel">
                <div className="text-type">
                    <i className="fa fa-bold" onClick={handleBoldIconClick}></i>
                    <i className="fa fa-italic"></i>
                </div>

                <div className="text-format">
                    <i className="fa fa-link"></i>
                    <i className="fa fa-image"></i>
                </div>
            </div>

            <div className="markdown-content">
                <textarea 
                    className="markdown-textarea"
                    id="markdown-textarea"
                    name={props.name}
                    value={content}
                    onChange={handleContentChange}
                    onMouseUp={handleTextareaMouseUp}
                ></textarea>
                <div className="markdown-result">
                    <ReactMarkdown 
                        remarkPlugins={[remarkMath]}
                        rehypePlugins={[rehypeKatex]}
                        children={content}
                    />
                </div>
            </div>
        </div>
    )
}

export default TextEditor;