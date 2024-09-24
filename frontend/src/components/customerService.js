let API_ENDPOINT = process.env.REACT_APP_API_ENDPOINT;
let API_KEY = process.env.REACT_APP_API_KEY;

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