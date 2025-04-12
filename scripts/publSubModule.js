// @ts-check
const fs = require("fs");
const path = require("path");
const spawn = require("child_process");
const inquirer = require("inquirer");
const rootpath = path.resolve(__dirname, "../packages");

function checkPackageExist(path) {
    if (!fs.existsSync(path)) {
        throw new Error(`${path} is not exist`);
    }
}

function getPackageJson(path) {
    checkPackageExist(path);
    return JSON.parse(fs.readFileSync(path).toString());
}

function changePackageJson(data, path) {
    fs.writeFileSync(path, JSON.stringify(data, null, 4) + "\n");
}
async function publ() {
    const packages = process.argv.slice(2);
    if (packages.length > 1) {
        throw new Error(`子模块的包请单独发布`);
    }
    const publPackage = packages[0];
    const publPath = `${rootpath}/${publPackage}`;
    checkPackageExist(publPath);
    const packagePath = `${publPath}/package.json`;
    const packageJSON = getPackageJson(packagePath);
    const _versionArr = packageJSON.version.split(".");
    const lastVersion = _versionArr[_versionArr.length - 1];
    let recommendVersion = "";
    for (let i = 0; i < _versionArr.length; i++) {
        let v = _versionArr[i];
        if (i === _versionArr.length - 1) {
            v++;
            recommendVersion += v;
            break;
        }
        recommendVersion += `${v}.`;
    }
    // @ts-ignore
    const { version } = await inquirer.prompt([
        {
            type: "input",
            name: "version",
            default: recommendVersion,
            message: `${packageJSON.name}, 当前版本 ${packageJSON.version} 请输入发布的版本号\n`,
        },
    ]);

    packageJSON.version = version;
    console.log(`准备发布${version}`);
    changePackageJson(packageJSON, packagePath);

    spawn.execSync(`cd ${publPath} && npm publ`, {
        stdio: ["inherit", "inherit", "pipe"],
    });
    const dependencies = {
        [packageJSON.name]: version,
    };
    const files = fs.readdirSync(rootpath);
    for (const file of files) {
        const filepath = `${rootpath}/${file}/package.json`;
        const package = JSON.parse(fs.readFileSync(filepath).toString());
        for (const pkg in dependencies) {
            if (package.dependencies) {
                for (const key in package.dependencies)
                    if (key === pkg || key.includes(`${pkg}-`)) {
                        package.dependencies[key] = dependencies[pkg];
                    }
            }
        }
        fs.writeFileSync(filepath, JSON.stringify(package, null, 4) + "\n");
    }
}

publ();
