export class PlayerConsole {
	private static title = 'nostalgic-diva';

	private static createMessage(message: any): string {
		return `[${PlayerConsole.title}] ${message}`;
	}

	public static assert(
		condition?: boolean | undefined,
		message?: any,
		...optionalParams: any
	): void {
		console.assert(
			condition,
			PlayerConsole.createMessage(message),
			...optionalParams,
		);
	}

	public static debug(message?: any, ...optionalParams: any): void {
		console.debug(PlayerConsole.createMessage(message), ...optionalParams);
	}

	public static error(message?: any, ...optionalParams: any): void {
		console.error(PlayerConsole.createMessage(message), ...optionalParams);
	}

	public static warn(message?: any, ...optionalParams: any): void {
		console.warn(PlayerConsole.createMessage(message), ...optionalParams);
	}
}
