import { APIApplicationCommand } from "discord-api-types/v10";

export enum IntegrationType {
	GUILD_INSTALL,
	USER_INSTALL
}

export enum InteractionContextType {
	GUILD,
	BOT_DM,
	PRIVATE_CHANNEL
}

export type APIApplicationCommandWithContexts =
	APIApplicationCommand
	& {
		integration_types?: IntegrationType[],
		contexts?: InteractionContextType[]
	};
