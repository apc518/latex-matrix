let activeInput;

let initialTypingInCell = false;
let editingInCell = false;

// initialize fullGrid
let fullGrid = [];
for(let i = 0; i < 20; i++){
    fullGrid.push([]);
    for(let k = 0; k < 20; k++){
        fullGrid[i].push(`${String.fromCharCode(97+i)}_${k+1}`);
    }
}

// initialize MathJax
MathJax = {
    tex: {
        inlineMath: [['$', '$'], 
                    ['\\(', '\\)']]
    },
    svg: {
        fontCache: 'global'
    }
};

// setInterval(() => console.log(`initialTypingInCell: ${initialTypingInCell}, editingInCell: ${editingInCell}`), 1000);

/**
 * @author Andy Chamberlain // https://github.com/apc518
 */
const init = () => {
    genTable();
    document.getElementById('matrix-enclosing').oninput = () => genLatex();
    document.getElementById('matrix-align').oninput = () => genLatex();
    let rowsInput = document.getElementById('rows');
    let colsInput = document.getElementById('cols');
    rowsInput.onclick = () => rowsInput.select();
    rowsInput.oninput = () => {
        genTable();
        genLatex();
    };
    colsInput.onclick = () => colsInput.select();
    colsInput.oninput = () => {
        genTable();
        genLatex();
    };

    rowsInput.click();
    rowsInput.focus();
    activeInput = rowsInput;

    document.addEventListener('mousedown', (e) => {
        if(e.target !== activeInput){
            initialTypingInCell = false;
            editingInCell = false;
        }
        else{
            editingInCell = true;
        }
        if(['input', 'select'].indexOf(e.target.nodeName.toLowerCase()) > -1){
            activeInput = e.target;
        }
    });

    // grid navigation logic
    document.addEventListener('keydown', (e) => {
        // console.log(e);
        let numRows = document.getElementById('rows').value;
        let numCols = document.getElementById('cols').value;

        // figure out which row/col we are in, if in the table. 
        let row = -1;
        let col = -1;
        for(let i = 0; i < numRows; i++){
            for(let k = 0; k < numCols; k++){
                if(document.getElementById('tableWrapper').children[0].children[i].children[k].children[0] == document.activeElement){
                    row = i;
                    col = k;
                }
            }
        }

        if(row >= 0 && col >= 0){
            if(!e.key.startsWith("Arrow")
                && e.key !== 'Enter'
                && e.key !== 'Tab'
                && e.key !== 'Escape'
                && !editingInCell && !initialTypingInCell){
                initialTypingInCell = true;
                editingInCell = false;
            }

            if(e.key === 'Tab'){
                initialTypingInCell = false;
                editingInCell = false;
            }

            if(e.key === 'Escape'){
                document.activeElement.click();
            }

            if(e.key === 'Enter'){
                let newCell;
                if(editingInCell || initialTypingInCell){ // commiting whatever is written
                    if(e.shiftKey){
                        newCell = document.getElementById('tableWrapper').children[0].children[Math.max(0, row-1)].children[col].children[0];    
                    }
                    else{
                        newCell = document.getElementById('tableWrapper').children[0].children[Math.min(numRows - 1, row+1)].children[col].children[0];
                    }
                    editingInCell = false;
                    initialTypingInCell = false;
                    setTimeout(() => newCell.click(), 10); // prevents text editing from enter key on new cell
                }
                else{
                    newCell = document.activeElement;
                    let len = newCell.value.length;

                    if (newCell.setSelectionRange) {
                        newCell.focus();
                        newCell.setSelectionRange(len, len);
                    } else if (newCell.createTextRange) {
                        var t = newCell.createTextRange();
                        t.collapse(true);
                        t.moveEnd('character', len);
                        t.moveStart('character', len);
                        t.select();
                    }

                    initialTypingInCell = false;
                    editingInCell = true;
                }
            }

            if(e.key.startsWith("Arrow")){
                if(!editingInCell){
                    let newCell;
                    if(e.key === "ArrowUp"){
                        newCell = document.getElementById('tableWrapper').children[0].children[Math.max(0, row-1)].children[col].children[0];
                    }
                    else if(e.key === "ArrowDown"){
                        newCell = document.getElementById('tableWrapper').children[0].children[Math.min(numRows - 1, row+1)].children[col].children[0];
                    }
                    else if(e.key === "ArrowLeft"){
                        newCell = document.getElementById('tableWrapper').children[0].children[row].children[Math.max(0, col-1)].children[0];
                    }
                    else if(e.key === "ArrowRight"){
                        newCell = document.getElementById('tableWrapper').children[0].children[row].children[Math.min(numCols - 1, col+1)].children[0];
                    }
                    // if we instantly clicked on newCell, 
                    // then the selection process would happen at the same time as the arrow press,
                    // but arrow presses undo selections, so the selection wouldn't occur
                    // but we dont have to wait long! (only 1ms in this case)
                    setTimeout(() => newCell.click(), 10);
                }
            }
        }
    });

    console.log(fullGrid);

    genLatex();
}


/**
 * @author Jason Warta // https://github.com/jasonwarta
 * a couple tweaks by Andy Chamberlain
 */
const genTable = () => {
    let table = document.getElementById('tableWrapper');
    let rows = document.getElementById('rows').value;
    let cols = document.getElementById('cols').value;

    table.innerHTML = "";

    let table_wip = document.createElement('table');
    for (let i = 0; i < rows; i++) {
        let tr = document.createElement('tr');
        for (let k = 0; k < cols; k++) {
            let td = document.createElement('td');
            let input = document.createElement('input');
            input.type = 'text';
            input.className = "cell";
            input.onclick = () => {
                if(!editingInCell && !initialTypingInCell) input.select();
            };
            input.value = fullGrid[i][k];
            input.oninput = () => genLatex();
            td.appendChild(input);
            tr.appendChild(td);
        }
        table_wip.appendChild(tr);
    }
    table.appendChild(table_wip);
}

/**
 * @author Jason Warta, Andy Chamberlain // https://github.com/jasonwarta, https://github.com/apc518
 */
const genLatex = () => {
    let table = document.getElementById('tableWrapper').children[0];
    let matrix_enclosing = document.getElementById('matrix-enclosing').value;
    let matrix_align = document.getElementById('matrix-align').value;
    let latex = `${matrix_align} \\begin{${matrix_enclosing}}\n`;
    let rows = table.children;
    for (let row = 0; row < rows.length; row++) {
        let cols = rows[row].children;
        for (let col = 0; col < cols.length; col++) {
            let val = cols[col].children[0].value;
            let neg = false;
            if (val.indexOf('-') == 0) {
                neg = true;
                val = val.substr(1, val.length);
            }
            if (val.indexOf('/') != -1) {
                let vals = val.split('/');
                val = `\\frac{${vals[0]}}{${vals[1]}}`
            }
            latex += `${neg ? '-' : ''}${val}`;
            if (col == cols.length - 1) {
                if (row == rows.length - 1) {
                    latex += " \n";
                } else {
                    latex += " \\\\\n";
                }
            } else {
                latex += " & ";
            }
        }
    }
    latex += `\\end{${matrix_enclosing}}  ${matrix_align}`

    updateFullGrid();

    document.getElementById("latex").value = latex;
    document.getElementById("preview").innerHTML = latex;
    MathJax.typeset();
    
    let previewWrapperWidth = Math.max(250, document.getElementsByClassName('MJX-TEX')[0].clientWidth + 60);
    let previewWrapperHeight = Math.max(150, document.getElementsByClassName('MJX-TEX')[0].clientHeight + 60);
    let previewWrapper = document.getElementById('preview');
    previewWrapper.style.width = `${previewWrapperWidth}px`;
    previewWrapper.style.height = `${previewWrapperHeight}px`;
    // previewWrapper.style.left = `${window.innerWidth / 2 - previewWrapperWidth / 2}px`;
}

const updateFullGrid = () => {
    let table = document.getElementById('tableWrapper').children[0];
    let rows = table.children;
    for (let row = 0; row < rows.length; row++) {
        let cols = rows[row].children;
        for (let col = 0; col < cols.length; col++) {
            let val = cols[col].children[0].value;
            fullGrid[row][col] = val;
        }
    }
}

/**
 * @author Andy Chamberlain // https://github.com/apc518
 */
const copyLatex = () => {
    var copyText = document.getElementById("latex");

    /* Select the text field */
    copyText.select();
    copyText.setSelectionRange(0, 99999);

    /* Copy the text inside the text field */
    navigator.clipboard.writeText(copyText.value);

    activeInput.click();
    activeInput.focus();

    Swal.fire({
        icon: 'success',
        title: 'Copied to Clipboard',
        showConfirmButton: false,
        timer: 1000
    });
}

/**
 * @author Andy Chamberlain // https://github.com/apc518
 */
const explain = () => {
    Swal.fire({
        title: 'Familiar Controls',
        text: 'Selecting cells, using tab and enter, and using the arrow keys all work exactly like google sheets!',
        icon: 'info',
        confirmButtonText: 'Nice.'
    });
}