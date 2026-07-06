const API_URL = 'https://pedida-backend.onrender.com/api';

interface ProposalData {
    answer: string;
    attemptsNo: number;
    timestamp: string;
}

export const sendProposalResponse = async (data: ProposalData) => {
    try {
        const response = await fetch(`${API_URL}/proposal`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        return await response.json();
    } catch (error){
        console.error('Error enviando datos al backend:', error);
    }
};