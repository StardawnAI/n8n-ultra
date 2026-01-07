# Custom Node Development - Setup Guide

## Requirements
- **Node.js**: v20 or v22 (tested with v22.19.0)
- **pnpm**: Required for workspace management

## Setup

1. **Install pnpm**
```bash
npm install -g pnpm
```

2. **Clone and install dependencies**
```bash
git clone your-n8n-fork
cd n8n-advanced
pnpm install
```

3. **Build the project**
```bash
pnpm build
```

## Create Custom Node

### 1. Create node structure
```bash
mkdir packages/nodes-base/nodes/YourNode
```

### 2. Create node file
Create `packages/nodes-base/nodes/YourNode/YourNode.node.ts`:

see: Custom-Node-Development-Guide.md

### 3. Create credentials file
Create `packages/nodes-base/credentials/YourNodeApi.credentials.ts`:

```typescript
import type {
    IAuthenticateGeneric,
    ICredentialType,
    INodeProperties,
} from 'n8n-workflow';

export class YourNodeApi implements ICredentialType {
    name = 'yourNodeApi';
    displayName = 'Your Node API';
    properties: INodeProperties[] = [
        {
            displayName: 'API Key',
            name: 'apiKey',
            type: 'string',
            typeOptions: {
                password: true,
            },
            default: '',
        },
    ];

    authenticate: IAuthenticateGeneric = {
        type: 'generic',
        properties: {
            headers: {
                Authorization: '=Bearer {{$credentials.apiKey}}',
            },
        },
    };
}
```

### 4. Register in package.json
Edit `packages/nodes-base/package.json` and add to the `n8n` section:

```json
"n8n": {
  "credentials": [
    "dist/credentials/YourNodeApi.credentials.js"
  ],
  "nodes": [
    "dist/nodes/YourNode/YourNode.node.js"
  ]
}
```

## Build and Run

1. **Build**
```bash
pnpm build
```

2. **Start n8n**
```bash
pnpm start
```

Your custom node will appear in the n8n interface.

## Protect Custom Nodes from Updates

Add to `.gitattributes` to prevent upstream merges from overwriting custom nodes:
(this is relevant if you are running n8n on a fork like this one)

```gitattributes
*.sh text eol=lf
.devcontainer/** merge=ours
workflows/** merge=ours
.github/** merge=ours
workflows-static/** merge=ours
initial-credentials/** merge=ours
updates/** merge=ours
docker-compose.yml merge=ours
requirements.txt merge=ours
README.md merge=ours
TODO.md merge=ours
Install-Custom-Nodes.md merge=ours

# add custom nodes to packages (.github/actions/inject-custom-nodes/action.yml must be adjusted to add new nodes as well as down below)
.github/actions/inject-custom-nodes/** merge=ours
# Remberg Custom Node
packages/nodes-base/nodes/Remberg/** merge=ours
packages/nodes-base/credentials/RembergApi.credentials.ts merge=ours


```

## Important Notes

- Use **pnpm** not npm (workspace support required)
- Build takes 5-8 minutes on first run
- TypeScript errors resolve after `pnpm install`
- Node.js v20+ recommended, v22+ for pnpm compatibility
- Empty lines in `.gitattributes` are allowed for organization