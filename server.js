const {
    createConnection,
    TextDocuments,
    Diagnostic,
    DiagnosticSeverity,
    ProposedFeatures,
    TextDocumentSyncKind
} = require('vscode-languageserver/node');

const { TextDocument } = require('vscode-languageserver-textdocument');

// Create a connection for the server
const connection = createConnection(ProposedFeatures.all);

// Create a simple text document manager
const documents = new TextDocuments(TextDocument);

documents.onDidChangeContent(change => {
    validateTextDocument(change.document);
});

connection.onInitialize(() => {
    return {
        capabilities: {
            textDocumentSync: TextDocumentSyncKind.Incremental,
            // Add other capabilities here
        }
    };
});

function validateTextDocument(textDocument) {
    const text = textDocument.getText();
    const diagnostics = [];
    const pattern = /\bandika\s*\((.*?)\)/g;
    let m;

    while ((m = pattern.exec(text)) !== null) {
        if (m.index === pattern.lastIndex) {
            pattern.lastIndex++;
        }

        if (!m[1]) {
            const diagnostic = {
                severity: DiagnosticSeverity.Error,
                range: {
                    start: textDocument.positionAt(m.index),
                    end: textDocument.positionAt(m.index + m[0].length)
                },
                message: `Missing argument in andika() function`,
                source: 'Nuru Language Server'
            };
            diagnostics.push(diagnostic);
        }
    }

    connection.sendDiagnostics({ uri: textDocument.uri, diagnostics });
}

documents.listen(connection);
connection.listen();
