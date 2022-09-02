export class PlayerConsole {
	private static title = 'nostalgic-diva';

	public static assert = (
		condition?: boolean | undefined,
		message?: any,
		...optionalParams: any
	): void =>
		console.assert(
			condition,
			`[${PlayerConsole.title}] ${message}`,
			...optionalParams,
		);

	public static debug = (message?: any, ...optionalParams: any): void =>
		console.debug(`[${PlayerConsole.title}] ${message}`, ...optionalParams);

	public static error = (message?: any, ...optionalParams: any): void =>
		console.error(`[${PlayerConsole.title}] ${message}`, ...optionalParams);

	public static warn = (message?: any, ...optionalParams: any): void =>
		console.warn(`[${PlayerConsole.title}] ${message}`, ...optionalParams);
}
