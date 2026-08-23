// import { run } from './run/run.js'
import { run } from './run/run.js';
console.log('STYLE TOKEN COMPILER');
const [command, rootDir, configJson] = process.argv.slice(2);
switch (command) {
    case 'exe': {
        const overrides = configJson
            ? JSON.parse(configJson)
            : {};
        // const cliDirectory = path.dirname(process.argv[1])
        // const compilerDirectory = path.dirname(cliDirectory)
        // const projectRoot = path.resolve(
        //   compilerDirectory,
        //   rootDir,
        // )
        // console.log(overrides)
        // console.log('projectRoot:', projectRoot)
        run(rootDir, overrides);
        break;
    }
    default:
        console.log('Options:');
        console.log('  run <rootDir>                Use specified root directory');
        console.log('  run <rootDir> <configJson>   Use optional JSON configuration overrides');
}
