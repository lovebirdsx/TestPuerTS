import * as path from 'path';
import { getCmdArgs, ICmdArgs } from './cmdArgs';
import { setExecVerbose } from './common/exec';

interface IConfig extends ICmdArgs {
	localJsEnvPorts: number[];
	packagesPath: string;
}

const config: IConfig = {
	noClear: true,
	verbose: false,
	noCache: false,
	localJsEnvPorts: [9229, 9230],
	packagesPath: path.resolve(__dirname, '../../'),
};

let isInit = false;
function init() {
	if (isInit) {
		return;
	}

	const cmdArgs = getCmdArgs();
	Object.keys(cmdArgs).forEach((key) => {
		const k = key as keyof ICmdArgs;
		if (cmdArgs[k] !== undefined) {
			config[k] = cmdArgs[k];
		}
	});

	if (cmdArgs.verbose) {
		setExecVerbose(true);
	}

	isInit = true;
}

export function getConfig(): IConfig {
	init();

	return config;
}
