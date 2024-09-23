const API_ENDPOINT = process.env.REACT_APP_API_ENDPOINT || "https://q2tf3g5e4l.execute-api.ap-southeast-1.amazonaws.com/v1";
const API_KEY = process.env.REACT_APP_API_KEY || "XZSNV5hFIaaCJRBznp9mW2VPndBpD97V98E1irxs";

export const addCustomerToAPI = async (customer) => {
    const response = await fetch(`${API_ENDPOINT}/item?resource=customer`, {
        method: 'POST',
        headers: {
            'x-api-key': API_KEY
        },
        body: JSON.stringify(customer),
    });

    if (!response.ok) {
        throw new Error('Failed to add customer to API');
    }

    const data = await response.json();
    return data;
};