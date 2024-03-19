import process from "process";

export default {
	port: Number(process.env["PORT"]) || 8080,
	bot_token: process.env["DISCORD_TOKEN"] || "",
	bot_public_key: process.env["DISCORD_PUBLIC_KEY"] || "",
	use_https: !!process.env["USE_HTTPS"],
};
