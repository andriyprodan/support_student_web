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

    const [history, setHistory] = useState([content]);
    const [currContentIndex, setCurrContentIndex] = useState(0);

    useEffect(() => {
        if (history[currContentIndex] !== content){
            console.log('!!', currContentIndex, content);
            setHistory(history.slice(0, currContentIndex+1).concat([content]));
            setCurrContentIndex(currContentIndex + 1);
        }

        let textArea = document.getElementById("markdown-textarea");
        textArea.onkeydown = (e) => {
            if (e.ctrlKey) {
                if (e.key == 'z') {
                    e.preventDefault();
                    console.log('!', history[currContentIndex - 1], currContentIndex - 1);
                    undo();
                } else if (e.key == 'y') {
                    e.preventDefault();
                    redo();
                }
            }
        }

        if (selection.selectTextOnComponentUpdate) {
            textArea.focus();
            textArea.setSelectionRange(selection.start, selection.end);
            textArea.selectionEnd = selection.end;
            setSelection({
                ...selection,
                selectTextOnComponentUpdate: false,
            })
        }
    }, [selection, content, history, currContentIndex]);

    function undo() {
        console.log('!', history[currContentIndex - 1], currContentIndex - 1);
        if (currContentIndex - 1 >= 0) {
            setContent(history[currContentIndex - 1]);
            setCurrContentIndex(currContentIndex - 1);
        }
    }

    function redo() {
        if (currContentIndex + 1 <= history.length - 1) {
            setContent(history[currContentIndex + 1]);
            setCurrContentIndex(currContentIndex + 1);
        }
    }

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
    
    function toggleImageUploadDialogue() {
        let tab = window.$('.image-upload-dialogue');
        
        if (tab.hasClass('active')) {
            tab.css('max-height', '0').on('transitionend', () => {
                tab.css('display', 'none');
            }).unbind('transitionend');
        } else {
            // call outerWidth to force reflow
            tab.css('display', 'flex').outerWidth();
            tab.css('max-height', '700px');
        }

        tab.toggleClass('active');
    }

    function handleImagePreview(e) {
        let file = e.target.files[0];
        let fr = new FileReader();
        fr.onload = (e) => {
            let bgImage = 'url("' + e.target.result + '")';
            document.getElementById('image-preview').style.backgroundImage = bgImage;
        }
        fr.readAsDataURL(file);
    }

    async function handleAddImageBtnClick(e) {
        e.preventDefault();
        let input = document.getElementById('image-input');
        if (!input.files[0]) {
            alert('Please, add an image!');
            return;
        }
        let formData = new FormData();
        formData.append('image', input.files[0]);
        try {
            let resp = await props.axiosInstance.post(props.uploadImagesURL, formData);
            let image = `\n![Image info](${resp.data.url})`;
            setContent(content + image);
            toggleImageUploadDialogue();
        } catch (error) {
            console.log(error);
        }
    }

    function toggleOrderedListIconClick() {
        // coming soon
    }

    function toggleUnorderedListIconClick() {
        // coming soon
    }

    return (
        <div className="form-group">
            <div className="content-label">{ props.label }</div>
            <div className="markdown-control-panel">
                <div className="text-type">
                    <i className="fa fa-bold" onClick={handleBoldIconClick}></i>
                    <i className="fa fa-italic" onClick={handleItalicIconClick}></i>
                </div>

                <div className="text-format">
                    <i className="fa fa-link" onClick={handleHyperlinkIconClick}></i>
                    <i className="fa fa-image" onClick={toggleImageUploadDialogue}></i>
                </div>

                <div className="lists">
                    <i className="fa fa-list-ol" onClick={toggleOrderedListIconClick}></i>
                    <i className="fa fa-list" onClick={toggleUnorderedListIconClick}></i>
                </div>

                <div className="undo-redo">
                    <i className="fa fa-undo" onClick={undo}></i>
                    <i className="fa fa-redo" onClick={redo}></i>
                </div>
            </div>

            <div className="image-upload-dialogue" style={{display: 'none', maxHeight: "0"}}>
                <div className="image-upload-dialogue__inner">
                    <div id="image-preview"></div>
                    <div>
                        <p>Choose image:</p>
                        <div className="image-input-group">
                            <label htmlFor="image-input">Choose Image</label>
                            <input type="file" id="image-input" className="image-input" onChange={handleImagePreview}/>
                        </div>
                        <button className="btn btn-info d-b" onClick={handleAddImageBtnClick}>Add Image</button>
                    </div>
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

