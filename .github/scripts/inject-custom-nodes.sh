#!/bin/bash

# Navigate to nodes-base
cd packages/nodes-base || exit 1

echo "Injecting custom nodes into package.json..."

# Helper function to inject if missing
inject_if_missing() {
    SEARCH=$1
    INSERT=$2
    TYPE=$3 # nodes or credentials
    if ! grep -q "$SEARCH" package.json; then
        echo "Injecting $SEARCH..."
        sed -i "/\"$TYPE\": \[/,/\]/ s|]|    \"$INSERT\",\n  ]|" package.json
    else
        echo "$SEARCH already present."
    fi
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
