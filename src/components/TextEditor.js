import React, {useState, useEffect} from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import 'katex/dist/katex.min.css'

import './TextEditor.css';

const PROTOCOLS = ['https://', 'http://']

function TextEditor(props) {
    const [content, setContent] = useState('');
    const [selection, setSelection] = useState({selectTextOnComponentUpdate: false});

    useEffect(() => {
        if (selection.selectTextOnComponentUpdate) {
            let textArea = document.getElementById("markdown-textarea");
            textArea.focus();
            textArea.setSelectionRange(selection.start, selection.end);
            textArea.selectionEnd = selection.end;
            setSelection({
                ...selection,
                selectTextOnComponentUpdate: false,
            })
        }
    }, [selection]);

    function handleContentChange(e) {
        setContent(e.target.value);
    }

    function wrapSelectedText(openTag, closeTag, placeholder='', selectWrappedText = true) {
        let textArea = document.getElementById("markdown-textarea");
        let len = textArea.value.length;
        let start = textArea.selectionStart;
        let end = textArea.selectionEnd;

        // check if the selected text is already wrapped into that Tags
        if (
            textArea.value.substring(start - openTag.length, start) === openTag &&
            textArea.value.substring(end, end + closeTag.length) === closeTag
        ) {
            // remove tags
            let arr = textArea.value.split('');
            arr.splice(start - openTag.length, openTag.length, '');
            // subtract openTag.length - 1, because length of array is decreased by this number
            // -1, because an empty string('') is added to array after splice
            arr.splice(end - (openTag.length - 1), closeTag.length, '');
            setContent(arr.join(''));
            return;
        }

        let selectedText = textArea.value.substring(start, end);
        // If there is no selected text (selectionStart and selectionEnd are the same) placeholder is used
        let text = start === end ? placeholder : selectedText
        let replacement = openTag + text + closeTag;
        let new_content = textArea.value.substring(0, start) + replacement + textArea.value.substring(end, len);
        setContent(new_content);
        
        if (selectWrappedText) {
            setSelection({
                selectTextOnComponentUpdate: true,
                start: start + openTag.length,
                end: start + openTag.length + text.length
            })
        }
    }

    function handleBoldIconClick() {
        wrapSelectedText("**", "**", 'Strong text');
    }

    function handleItalicIconClick() {
        wrapSelectedText("*", "*", 'Italic text');
    }

    function handleHyperlinkIconClick() {
        let textArea = document.getElementById("markdown-textarea");
        let selectedText = textArea.value.substring(textArea.selectionStart, textArea.selectionEnd);

        let descriptionPlaceholder = 'Link description';
        let linkPlaceholder = 'www.example.com'

        let protocol = '';
        if (!PROTOCOLS.some(p => selectedText.includes(p))) {
            protocol = 'https://';
        }
 
        wrapSelectedText(` [${descriptionPlaceholder}](${protocol}`, ') ', linkPlaceholder);
    }

    return (
        <div className="form-group">
            <div>{ props.label }</div>
            <div className="markdown-control-panel">
                <div className="text-type">
                    <i className="fa fa-bold" onClick={handleBoldIconClick}></i>
                    <i className="fa fa-italic" onClick={handleItalicIconClick}></i>
                </div>

                <div className="text-format">
                    <i className="fa fa-link" onClick={handleHyperlinkIconClick}></i>
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