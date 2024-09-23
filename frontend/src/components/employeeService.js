import AWS from 'aws-sdk'; 
import awsconfig from '../aws-exports';

const API_ENDPOINT = process.env.REACT_APP_API_ENDPOINT;
const API_KEY = process.env.REACT_APP_API_KEY;

AWS.config.update({
    region: awsconfig.region,
    accessKeyId: process.env.REACT_APP_ACCESS_KEY,
    secretAccessKey: process.env.REACT_APP_SECRET_KEY,
});

const cognito = new AWS.CognitoIdentityServiceProvider({
    region: awsconfig.region
});

export const createUserInCognito = async (email, role) => {
    const params = {
        UserPoolId: awsconfig.aws_user_pools_id,
        Username: email,
        UserAttributes: [
            { Name: 'email', Value: email },
            { Name: 'email_verified', Value: 'true' }
        ],
        DesiredDeliveryMediums: ['EMAIL']
    };

    const groupName = role === 'admin' ? 'stanghero-admin-group' : 'stanghero-user-group';

    try {
        const result = await cognito.adminCreateUser(params).promise();
        console.log('User created in Cognito:', result);

        if (groupName) {
            await cognito.adminAddUserToGroup({
                UserPoolId: awsconfig.aws_user_pools_id,
                Username: email,
                GroupName: groupName
            }).promise();
            console.log(`User added to group: ${groupName}`);
        }

        return result;
    } catch (err) {
        console.error('Error creating user in Cognito or adding to group:', err);
        throw err;
    }
};

export const addEmployeeToAPI = async (employee) => {
    const response = await fetch(`${API_ENDPOINT}/item?resource=employee`, {
        method: 'POST',
        headers: {
            'x-api-key': API_KEY
        },
        body: JSON.stringify(employee),
    });

    if (!response.ok) {
        throw new Error('Failed to add employee to API');
    }

    const data = await response.json();
    return data;
};

export const updateEmployeeToAPI = async (employee) => {
    const response = await fetch(`${API_ENDPOINT}/item?resource=employee`, {
        method: 'PUT',
        headers: {
            'x-api-key': API_KEY
        },
        body: JSON.stringify(employee),
    });

    if (!response.ok) {
        throw new Error('Failed to update employee to API');
    }

    const data = await response.json();
    return data;
};

export const addUserToGroupInCognito = async (email, role) => {
    let groupName;
    switch (role) {
        case 'admin':
            groupName = 'stanghero-admin-group';
            break;
        case 'user':
            groupName = 'stanghero-user-group';
            break;
        default:
            groupName = 'stanghero-default-group';
    }

    const params = {
        GroupName: groupName,
        UserPoolId: awsconfig.aws_user_pools_id,
        Username: email,
    };
    return await cognito.adminAddUserToGroup(params).promise();
};
  
export const removeUserFromGroupInCognito = async (email, role) => {
    let groupName;
    switch (role) {
        case 'admin':
            groupName = 'stanghero-admin-group';
            break;
        case 'user':
            groupName = 'stanghero-user-group';
            break;
        default:
            groupName = 'stanghero-default-group';
    }

    const params = {
        GroupName: groupName,
        UserPoolId: awsconfig.aws_user_pools_id,
        Username: email,
    };
    return await cognito.adminRemoveUserFromGroup(params).promise();
};

export const deleteEmployeeToAPI = async (employee) => {
    console.log('deleteEmployeeToAPI', employee)
    const response = await fetch(`${API_ENDPOINT}/item?resource=employee`, {
        method: 'DELETE',
        headers: {
            'x-api-key': API_KEY
        },
        body: JSON.stringify(employee),
    });

    if (!response.ok) {
        throw new Error('Failed to delete employee to API');
    }

    const data = await response.json();
    return data;
};

export const deleteUserInCognito = async (selectedEmployees) => {
    console.log('deleteUserInCognito', selectedEmployees)
    let response = '';
    for (const employee of Object.keys(selectedEmployees)) {
        response = await cognito.adminDeleteUser({
            UserPoolId: awsconfig.aws_user_pools_id,
            Username: selectedEmployees[employee]['email'],
        }).promise();
    }

    return response;
};