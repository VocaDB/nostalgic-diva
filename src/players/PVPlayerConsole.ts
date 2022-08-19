export class PVPlayerConsole {
	private static title = 'nostalgic-diva';

	public static assert = (
		condition?: boolean | undefined,
		message?: any,
		...optionalParams: any
	): void =>
		console.assert(
			condition,
			`[${PVPlayerConsole.title}] ${message}`,
			...optionalParams,
		);

	public static debug = (message?: any, ...optionalParams: any): void =>
		console.debug(
			`[${PVPlayerConsole.title}] ${message}`,
			...optionalParams,
		);

	public static error = (message?: any, ...optionalParams: any): void =>
		console.error(
			`[${PVPlayerConsole.title}] ${message}`,
			...optionalParams,
		);

	public static warn = (message?: any, ...optionalParams: any): void =>
		console.warn(
			`[${PVPlayerConsole.title}] ${message}`,
			...optionalParams,
		);
}
