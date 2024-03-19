export interface RandomFoxResponse {
	image: string,
	link: string
}

export async function get_random_fox(): Promise<RandomFoxResponse> {
	const response = await fetch("https://randomfox.ca/floof/");
	return await response.json();
}