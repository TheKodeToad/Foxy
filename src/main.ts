import "dotenv/config";

import express, { NextFunction } from "express";
import config from "./config";
import nacl from "tweetnacl";

import { APIApplication } from "discord-api-types/payloads";
import { REST } from "@discordjs/rest";
import { APIApplicationCommand, APIInteraction, APIInteractionResponseCallbackData, APIInteractionResponseChannelMessageWithSource, APIInteractionResponseDeferredChannelMessageWithSource, InteractionResponseType, InteractionType, RESTPostAPIChannelWebhookResult, Routes } from "discord-api-types/v10";
import { APIApplicationCommandWithContexts, IntegrationType, InteractionContextType } from "./types";
import { get_random_fox } from "./randomfox";

async function main() {
	const api = new REST().setToken(config.bot_token);

	const application = await api.get(Routes.currentApplication()) as APIApplication;
	console.log(`Application ID is ${application.id}`);

	await api.put(`/applications/${application.id}/commands`, {
		body: [
			{
				name: "fox",
				description: "Get a fox!",
				dm_permission: true,
				integration_types: [IntegrationType.USER_INSTALL],
				contexts: [
					InteractionContextType.GUILD,
					InteractionContextType.BOT_DM,
					InteractionContextType.PRIVATE_CHANNEL
				]
			}
		] as APIApplicationCommandWithContexts[]
	});
	console.log(`Registered commands sucessfully!`);

	const server = express();

	server.use(async (request, response, next) => {
		const signature = request.get("X-Signature-Ed25519");
		const timestamp = request.get("X-Signature-Timestamp");

		if (!signature || !timestamp) {
			console.log("Bad request");
			response.status(400).send("Bad request");
			return;
		}

		const data: Buffer = await new Promise((resolve) => {
			const chunks: Buffer[] = [];
			request.on("data", data => {
				chunks.push(data);
			})
			request.on("end", () => {
				resolve(Buffer.concat(chunks));
			});
		});

		const verified = nacl.sign.detached.verify(
			Buffer.from(timestamp + data),
			Buffer.from(signature, "hex"),
			Buffer.from(config.bot_public_key, "hex")
		);

		if (!verified) {
			response.status(401).send("Verification failed");
			return;
		}

		request.body = JSON.parse(data.toString("utf-8"));

		next();
	});

	server.post("/", async (request, response) => {
		const body: APIInteraction = request.body;

		switch (body.type) {
			case InteractionType.Ping:
				response.json({ type: 1 });
				break;
			case InteractionType.ApplicationCommand:
				response.send({
					type: InteractionResponseType.DeferredChannelMessageWithSource,
				} as APIInteractionResponseDeferredChannelMessageWithSource);

				const fox = await get_random_fox();

				api.patch(Routes.webhookMessage(application.id, body.token), {
					body: {
						embeds: [
							{
								title: "Fox :O",
								url: fox.link,
								color: 0xFF8200,
								image: { url: fox.image },
								footer: { text: "Requested from https://randomfox.ca" }
							}
						]
					} as APIInteractionResponseCallbackData
				});

				break;
		}
	});

	server.listen(config.port);
	console.log(`Listening on ${config.port}`);
}

main();
