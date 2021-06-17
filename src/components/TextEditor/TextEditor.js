import React, {useState, useEffect, useRef} from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import 'katex/dist/katex.min.css'

import './TextEditor.css';

const PROTOCOLS = ['https://', 'http://']

function TextEditor(props) {
    const [content, setContent] = useState('');
    const [selection, setSelection] = useState({selectTextOnComponentUpdate: false});
    const textArea = useRef(null);

    const [history, setHistory] = useState([content]);
    const [currContentIndex, setCurrContentIndex] = useState(0);

    function handleContentChange(e) {
        setContent(e.target.value);
    }

    // Set selection on the textarea
    useEffect(() => {
        if (selection.selectTextOnComponentUpdate) {
            textArea.current.focus();
            textArea.current.selectionEnd = selection.end;
            textArea.current.setSelectionRange(selection.start, selection.end);
            setSelection({
                ...selection,
                selectTextOnComponentUpdate: false,
            });
        }
    }, [selection,]);

    let lastBackspacedContent = useRef('');
    useEffect(() => {
        if (lastBackspacedContent.current.length && lastBackspacedContent.current !== content) {
            setHistory(history.slice(0, currContentIndex+1).concat([lastBackspacedContent.current]));
            setCurrContentIndex(currContentIndex + 1);
        }
    }, [content]);
    // set history with delay, when the content changes
    useEffect(() => {
        let saveDelay;
        if (history[currContentIndex] !== content){
            saveDelay = setTimeout(() => {
                setHistory(history.slice(0, currContentIndex+1).concat([content]));
                setCurrContentIndex(currContentIndex + 1);
            }, 500);
        }

        return (() => {
            clearTimeout(saveDelay);
        });
    }, [content, history]);

    function undo() {
        if (content !== history[currContentIndex]) {
            /* immediately save new content before delay ends
               it happens when the user makes undo action before 
               the new content is saved in history with delay in useEffect */
            setHistory(history.slice(0, currContentIndex+1).concat([content]));
            setContent(history[currContentIndex]);
        } else if (currContentIndex - 1 >= 0) {
            setContent(history[currContentIndex - 1]);
            setCurrContentIndex(prev => prev - 1);
        }
    }

    function redo() {
        if (currContentIndex + 1 <= history.length - 1) {
            setContent(history[currContentIndex + 1]);
            setCurrContentIndex(prev => prev + 1);
        }
    }

    // Undo / Redo shortcuts
    function handleTextAreaKeyDown(e) {
        if (e.ctrlKey) {
            let haveMatched = true;
            switch (e.key) {
                case 'z':
                    undo();
                    break;
                case 'y':
                    redo();
                    break;
                default:
                    haveMatched = false;
            }
            if (haveMatched) {
                e.preventDefault();
            }
        }

        let key = e.keyCode || e.charCode;
        // backspaceClicked
        if (key == 8 || key == 46) {
            let taValue = textArea.current.value;
            lastBackspacedContent.current = taValue.substring(0, taValue.length-1);
        }
    }

    function wrapSelectedText(openTag, closeTag, placeholder='', selectWrappedText = true) {
        let ta = textArea.current;

        let len = ta.value.length;
        let start = ta.selectionStart;
        let end = ta.selectionEnd;

        // check if the selected text is already wrapped into that Tags
        if (
            ta.value.substring(start - openTag.length, start) === openTag &&
            ta.value.substring(end, end + closeTag.length) === closeTag
        ) {
            // remove tags
            let arr = ta.value.split('');
            arr.splice(start - openTag.length, openTag.length, '');
            // subtract openTag.length - 1, because length of array is decreased by this number
            // -1, because an empty string('') is added to array after splice
            arr.splice(end - (openTag.length - 1), closeTag.length, '');
            setContent(arr.join(''));
            return;
        }

        let selectedText = ta.value.substring(start, end);
        // If there is no selected text (selectionStart and selectionEnd are the same) placeholder is used
        let text = start === end ? placeholder : selectedText
        let replacement = openTag + text + closeTag;
        let new_content = ta.value.substring(0, start) + replacement + ta.value.substring(end, len);
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
        let ta = textArea.current;

        let selectedText = ta.value.substring(ta.selectionStart, ta.selectionEnd);

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

    let imageInput = useRef(null);
    let imagePreview = useRef(null);

    function handleImagePreview(e) {
        let file = e.target.files[0];
        let fr = new FileReader();
        fr.onload = (e) => {
            let bgImage = 'url("' + e.target.result + '")';
            imagePreview.current.style.backgroundImage = bgImage;
        }
        fr.readAsDataURL(file);
    }

    async function handleAddImageBtnClick(e) {
        e.preventDefault();
        let input = imageInput.current;
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
                    <div id="image-preview" ref={imagePreview}></div>
                    <div>
                        <p>Choose image:</p>
                        <div className="image-input-group">
                            <label htmlFor="image-input">Choose Image</label>
                            <input type="file" id="image-input" ref={imageInput} className="image-input" onChange={handleImagePreview}/>
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
                    onKeyDown={handleTextAreaKeyDown}
                    ref={textArea}
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
