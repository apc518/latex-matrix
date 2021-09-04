/**
 * @author Andy Chamberlain // https://github.com/apc518
 */
const init = () => {
    genTable();
    document.getElementById('matrix-value').oninput = () => genLatex();
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
    genLatex();
}


/**
 * @author Jason Warta // https://github.com/jasonwarta
 * a couple tweaks by Andy Chamberlain
 */
const genTable = () => {
    let table = document.getElementById('table');
    let rows = document.getElementById('rows').value;
    let cols = document.getElementById('cols').value;

    table.innerHTML = "";

    let table_wip = document.createElement('table');
    for (let i = 0; i < rows; i++) {
        let tr = document.createElement('tr');
        for (let j = 0; j < cols; j++) {
            let td = document.createElement('td');
            let input = document.createElement('input');
            input.type = 'text';
            input.className = "cell";
            input.onclick = () => input.select();
            input.value = `${String.fromCharCode(97+i)}${j+1}`;
            input.oninput = () => genLatex();
            td.appendChild(input);
            tr.appendChild(td);
        }
        table_wip.appendChild(tr);
    }
    table.appendChild(table_wip);
}

/**
 * @author Jason Warta // https://github.com/jasonwarta
 */
const genLatex = () => {
    let table = document.getElementById('table').children[0];
    let matrix_type = document.getElementById('matrix-value').value;
    let latex = `$ \\begin{${matrix_type}}\n`;
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
    latex += `\\end{${matrix_type}}  $`

    document.getElementById("latex").value = latex;
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
        title: 'Controls like Excel',
        text: 'When you click on a cell, you can immediately start typing. If you then press tab, you will go to the next cell.',
        icon: 'info',
        confirmButtonText: 'Nice.'
    });
}