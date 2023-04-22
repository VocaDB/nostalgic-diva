import { PlayerConsole } from './PlayerConsole';
import { getScript } from './getScript';

const urls: string[] = [];

export async function ensureScriptLoaded(url: string): Promise<boolean> {
	if (urls.includes(url)) {
		PlayerConsole.debug(url, 'script is already loaded');
		return false;
	}

	try {
		PlayerConsole.debug(url, 'Loading script...');

		await getScript(url);

		if (urls.includes(url)) {
			PlayerConsole.debug(url, 'script is already loaded');
			return false;
		} else {
			urls.push(url);
			PlayerConsole.debug(url, 'script loaded');
			return true;
		}
	} catch (error) {
		PlayerConsole.error(url, 'Failed to load script');
		throw error;
	}
}
