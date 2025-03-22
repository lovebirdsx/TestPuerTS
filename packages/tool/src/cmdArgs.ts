import { info } from 'gulplog';

export interface ICmdArgs {
	verbose: boolean;
	noClear: boolean;
}

let cmdArgs: ICmdArgs | undefined;
export function getCmdArgs(): ICmdArgs {
	if (cmdArgs) {
		return cmdArgs;
	}

	const { argv } = process;
	cmdArgs = {
		verbose: argv.includes('--verbose') || argv.includes('-v'),
		noClear: argv.includes('--no-clear') || argv.includes('-n'),
	};

	if (cmdArgs.verbose) {
		info('cmdArgs:', cmdArgs);
	}

	return cmdArgs;
}
