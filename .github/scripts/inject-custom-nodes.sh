#!/bin/bash

# Navigate to nodes-base
cd packages/nodes-base || exit 1

echo "Injecting custom nodes into package.json..."

PKG_FILE="package.json"

# Helper function to inject entry before closing bracket of an array
# This properly adds a comma to the previous line and inserts the new entry
inject_if_missing() {
    local SEARCH="$1"
    local INSERT="$2"
    local SECTION="$3"  # "credentials" or "nodes"
    
    if grep -q "$SEARCH" "$PKG_FILE"; then
        echo "$SEARCH already present."
        return
    fi
    
    echo "Injecting $SEARCH..."
    
    # Use node.js for reliable JSON manipulation
    node -e "
        const fs = require('fs');
        const pkg = JSON.parse(fs.readFileSync('$PKG_FILE', 'utf8'));
        if (!pkg.n8n['$SECTION'].includes('$INSERT')) {
            pkg.n8n['$SECTION'].push('$INSERT');
        }
        fs.writeFileSync('$PKG_FILE', JSON.stringify(pkg, null, 2));
    "
}

# Define paths for injection
REMBERG_NODE="dist/nodes/Remberg/Remberg.node.js"
REMBERG_CRED="dist/credentials/RembergApi.credentials.js"
WA_NODE="dist/nodes/WhatsappPrivate/WhatsappPrivate.node.js"
WA_CRED="dist/credentials/WhatsappPrivateApi.credentials.js"

# Execute injections
inject_if_missing "Remberg.node.js" "$REMBERG_NODE" "nodes"
inject_if_missing "RembergApi.credentials.js" "$REMBERG_CRED" "credentials"
inject_if_missing "WhatsappPrivate.node.js" "$WA_NODE" "nodes"
inject_if_missing "WhatsappPrivateApi.credentials.js" "$WA_CRED" "credentials"

cd ../..
echo "Injection complete."
