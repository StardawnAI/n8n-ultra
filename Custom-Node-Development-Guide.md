# n8n Custom Node Development Guide

## Main Structure of a Custom Node

### 1. Node Definition (Main Block)

```typescript
export class YourNode implements INodeType {
    description: INodeTypeDescription = {
        displayName: 'Your Node Name',
        name: 'yourNodeName',
        // Icon options: single file or light/dark theme
        icon: 'file:youricon.svg',
        // OR for theme support:
        // icon: { light: 'file:youricon.svg', dark: 'file:youricon.dark.svg' },
        group: ['output'],
        version: 1,
        // Subtitle appears under the node name on canvas - shows current selection
        subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}', // e.g., "getAll: users"
        description: 'Node description',
        defaults: {
            name: 'Your Node Name',
        },
        inputs: ['main'],
        outputs: ['main'],
        credentials: [
            {
                name: 'yourApiCredentials',    // Must match credential file name
                required: true,                // Optional: make authentication mandatory
            },
        ],
        properties: [
            // UI definitions here
        ],
    };
}
```

**Important Values:**
- `subtitle`: Dynamically displays "operation: resource" under the node name on the canvas
- `name`: Unique internal name (camelCase)
- `displayName`: Name shown in the node list
- `icon`: Can be a single file or object with light/dark theme variants

## 2. Resource/Operation Pattern

### Resource Definition (MANDATORY)
```typescript
{
    displayName: 'Resource',
    name: 'resource',              // MUST be 'resource'
    type: 'options',
    noDataExpression: true,
    options: [
        { name: 'Users', value: 'users' },
        { name: 'Orders', value: 'orders' },
        { name: 'Products', value: 'products' },
    ],
    default: 'users',
}
```

### Operation Definitions (CRITICAL)
```typescript
// ONE OPERATION FOR EACH RESOURCE
{
    displayName: 'Operation',
    name: 'operation',             // MUST be 'operation' (NOT 'usersOperation')
    type: 'options',
    noDataExpression: true,
    displayOptions: { show: { resource: ['users'] } },    // Only for this resource
    options: [
        { name: 'Get All', value: 'getAll', action: 'Get all users' },
        { name: 'Create', value: 'create', action: 'Create a user' },
        { name: 'Get by ID', value: 'getById', action: 'Get user by ID' },
        { name: 'Update', value: 'update', action: 'Update a user' },
        { name: 'Delete', value: 'delete', action: 'Delete a user' },
    ],
    default: 'getAll',
}
```

**ABSOLUTELY CRITICAL:**
- All operation parameters MUST have `name: 'operation'`
- DO NOT use `name: 'usersOperation'` or similar variations
- n8n expects exactly this naming convention
- **This consistent naming is essential for the action preview to be displayed correctly in the UI**

## 3. Credentials Setup

### Credentials File Structure
Create a credentials file in the `/credentials` folder (e.g., `YourApiCredentials.credentials.ts`):

```typescript
import type {
    IAuthenticateGeneric,
    ICredentialType,
    INodeProperties,
} from 'n8n-workflow';

export class YourApiCredentials implements ICredentialType {
    name = 'yourApiCredentials';           // Must match the name in main node
    displayName = 'Your API Credentials';
    documentationUrl = 'https://your-api-docs.com';
    properties: INodeProperties[] = [
        {
            displayName: 'API Key',
            name: 'apiKey',                // Internal name for referencing
            type: 'string',
            typeOptions: {
                password: true,            // Masks the input field
            },
            default: '',
            description: 'Enter your API key from Your Service (https://your-service.com/api) - Enter without Bearer prefix',
        },
        {
            displayName: 'Base URL',
            name: 'baseUrl',
            type: 'string',
            default: 'https://api.your-service.com',    // Default API endpoint
            description: 'API URL endpoint',
        },
        // Additional credential fields as needed
        {
            displayName: 'Environment',
            name: 'environment',
            type: 'options',
            options: [
                { name: 'Production', value: 'prod' },
                { name: 'Sandbox', value: 'sandbox' },
            ],
            default: 'prod',
            description: 'Choose the environment',
        },
    ];

    // Authentication configuration
    authenticate: IAuthenticateGeneric = {
        type: 'generic',
        properties: {
            headers: {
                Authorization: '=Bearer {{$credentials.apiKey}}',    // Uses the apiKey field
            },
        },
    };
}
```

**Key Components:**
- `name`: Must exactly match the credential name referenced in the main node
- `displayName`: Shown in the credentials dropdown
- `documentationUrl`: Link to API documentation (optional)
- `properties`: Array of input fields for the credential
- `authenticate`: Defines how credentials are used in HTTP requests

**Property Field Types:**
- `password: true`: Masks sensitive data like API keys
- `type: 'options'`: Creates dropdown selection
- `default`: Pre-filled values for user convenience
- `description`: Helpful text explaining the field

**Authentication Patterns:**
```typescript
// Bearer Token (most common)
authenticate: IAuthenticateGeneric = {
    type: 'generic',
    properties: {
        headers: {
            Authorization: '=Bearer {{$credentials.apiKey}}',
        },
    },
};

// Basic Auth
authenticate: IAuthenticateGeneric = {
    type: 'generic',
    properties: {
        auth: {
            username: '={{$credentials.username}}',
            password: '={{$credentials.password}}',
        },
    },
};

// Custom Headers
authenticate: IAuthenticateGeneric = {
    type: 'generic',
    properties: {
        headers: {
            'X-API-Key': '={{$credentials.apiKey}}',
            'X-Client-ID': '={{$credentials.clientId}}',
        },
    },
};
```

## 4. Parameter Definitions

### Specific Parameters with displayOptions
```typescript
{
    displayName: 'User ID',
    name: 'userId',
    type: 'string',
    displayOptions: { 
        show: { 
            resource: ['users'], 
            operation: ['getById', 'update', 'delete']    // References 'operation'
        } 
    },
    default: '',
    required: true,
},

// Collection for optional parameters
{
    displayName: 'Additional Options',
    name: 'usersAdditionalOptions',        // CAN be specific
    type: 'collection',
    displayOptions: { show: { resource: ['users'], operation: ['getAll'] } },
    default: {},
    options: [
        { displayName: 'Page', name: 'page', type: 'number', default: 1 },
        { displayName: 'Limit', name: 'limit', type: 'number', default: 20 },
    ],
}
```

## 4. Operations Files (Backend Logic)

### File Structure
```
/operations
  ├── Users.ts
  ├── Orders.ts
  └── Products.ts
```

### Operations File Example (Users.ts)
```typescript
import type { IExecuteFunctions, IHttpRequestMethods } from 'n8n-workflow';

export async function executeUsers(this: IExecuteFunctions, i: number): Promise<{
    method: IHttpRequestMethods;
    endpoint: string;
    body: any;
}> {
    // CRITICAL: Query 'operation' (not 'usersOperation')
    const operation = this.getNodeParameter('operation', i) as string;
    
    // Query specific parameters
    const additionalOptions = this.getNodeParameter('usersAdditionalOptions', i, {}) as any;
    const userData = this.getNodeParameter('userData', i, {}) as any;

    let endpoint = '';
    let method: IHttpRequestMethods = 'GET';
    let body: any = {};

    switch (operation) {
        case 'getAll':
            endpoint = '/api/users';
            method = 'GET';
            
            // Build query parameters from additionalOptions
            const queryParams = new URLSearchParams();
            if (additionalOptions.page) queryParams.append('page', additionalOptions.page.toString());
            if (additionalOptions.limit) queryParams.append('limit', additionalOptions.limit.toString());
            
            if (queryParams.toString()) {
                endpoint += '?' + queryParams.toString();
            }
            break;

        case 'create':
            endpoint = '/api/users';
            method = 'POST';
            body = userData;
            break;

        case 'getById':
            const userId = this.getNodeParameter('userId', i) as string;
            endpoint = `/api/users/${userId}`;
            method = 'GET';
            break;

        case 'update':
            const userIdUpdate = this.getNodeParameter('userId', i) as string;
            endpoint = `/api/users/${userIdUpdate}`;
            method = 'PUT';
            body = userData;
            break;

        case 'delete':
            const userIdDelete = this.getNodeParameter('userId', i) as string;
            endpoint = `/api/users/${userIdDelete}`;
            method = 'DELETE';
            break;
    }

    return { method, endpoint, body };
}
```

## 5. Main Node Execute Method
```typescript
async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];

    for (let i = 0; i < items.length; i++) {
        const resource = this.getNodeParameter('resource', i) as string;

        let endpoint = '';
        let method: IHttpRequestMethods = 'GET';
        let body: any = {};

        try {
            // Resource-based routing
            if (resource === 'users') {
                const result = await executeUsers.call(this, i);
                endpoint = result.endpoint;
                method = result.method;
                body = result.body;
            } else if (resource === 'orders') {
                const result = await executeOrders.call(this, i);
                endpoint = result.endpoint;
                method = result.method;
                body = result.body;
            }
            // Additional resources...

            // API call
            const responseData = await this.helpers.requestWithAuthentication.call(
                this,
                'yourApiCredentials',
                {
                    method,
                    url: `https://your-api.com${endpoint}`,
                    body: Object.keys(body).length > 0 ? body : undefined,
                    json: true,
                },
            );

            returnData.push({
                json: responseData,
                pairedItem: { item: i },
            });

        } catch (error) {
            if (this.continueOnFail()) {
                returnData.push({
                    json: { error: error.message },
                    pairedItem: { item: i },
                });
            } else {
                throw error;
            }
        }
    }

    return this.prepareOutputData(returnData);
}
```

## 6. Data Flow

### UI → Code Flow
1. **User selects Resource:** `resource = 'users'`
2. **UI shows matching Operation:** due to `displayOptions: { show: { resource: ['users'] } }`
3. **User selects Operation:** `operation = 'getById'`
4. **UI shows matching Parameters:** due to `displayOptions: { show: { resource: ['users'], operation: ['getById'] } }`
5. **Execute is called:** `executeUsers.call(this, i)`
6. **Parameters are retrieved:**
   ```typescript
   const operation = this.getNodeParameter('operation', i);     // 'getById'
   const userId = this.getNodeParameter('userId', i);           // User Input
   ```
7. **HTTP call is generated:** `endpoint = '/api/users/123'`

## 7. Common Errors

### "Max iterations reached" Error
**Cause:** displayOptions references non-existent parameters
```typescript
// WRONG:
displayOptions: { show: { resource: ['users'], usersOperation: ['getAll'] } }

// CORRECT:
displayOptions: { show: { resource: ['users'], operation: ['getAll'] } }
```

### Parameter Name Conflicts
**Cause:** Multiple parameters with the same name
```typescript
// WRONG - Conflicts between resources:
{ name: 'additionalOptions', displayOptions: { show: { resource: ['users'] } } }
{ name: 'additionalOptions', displayOptions: { show: { resource: ['orders'] } } }

// CORRECT - Unique names:
{ name: 'usersAdditionalOptions', displayOptions: { show: { resource: ['users'] } } }
{ name: 'ordersAdditionalOptions', displayOptions: { show: { resource: ['orders'] } } }
```

### Missing Action Preview
**Cause:** Inconsistent operation naming prevents n8n from displaying the action selection preview
```typescript
// WRONG - Breaks action preview:
{ name: 'usersOperation' }
{ name: 'ordersOperation' }

// CORRECT - Enables action preview:
{ name: 'operation' }  // For all resources
```


### Example: Required Field Validation for Create Operation

```typescript
case 'create':
    // Validation for create operation
    if (!assetData.assetNumber?.trim()) {
        throw new Error('Asset Number is required for create operation');
    }
    if (!assetData.assetTypeId?.trim() && !assetData.assetTypeLabel?.trim()) {
        throw new Error('Either Asset Type ID or Asset Type Label is required for create operation');
    }

    endpoint = '/v2/assets';
    method = 'POST';
    body = assetData;
    break;
```

**Key Points:**
- Use `?.trim()` to check for empty/whitespace strings
- Throw descriptive error messages for required fields
- Validate "either-or" requirements before API call
- Implement validation before setting endpoint/method/body


## 8. Summary

- **Main Node:** Defines UI structure, MUST use `name: 'operation'` for all resources
- **Operations Files:** Contain HTTP endpoint logic per resource
- **Parameter Querying:** `getNodeParameter('operation', i)` for standard operation
- **displayOptions:** Must reference correct parameter names
- **Data Flow:** UI Selection → Parameters → Operations File → HTTP Call
- **Action Preview:** Only works with consistent `name: 'operation'` naming across all resources