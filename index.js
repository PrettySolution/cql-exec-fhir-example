const fs = require("fs");
const path = require("path");
const cql = require("cql-execution");
const cqlfhir = require("cql-exec-fhir");
const cqlvsac = require("cql-exec-vsac");

if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const bundlesPath = path.join(__dirname, 'r4', 'bundles');
const measurePath = path.join(__dirname, 'r4', 'cql', process.env.MEASURE);

function bundlesBuilder(bPath){
    // Load all bundles that have been found in ./r4/bundles folder
    let b = [];
    for (const fileName of fs.readdirSync(bPath)) {
        const file = path.join(bPath, fileName);
        if (!file.endsWith('.json')){
            continue;
        }
        const json = JSON.parse(fs.readFileSync(file, 'utf8'));
        b.push(json)
    }

    // Return bundles array
    return b;
}

function libraryBuilder(mPath) {
    // Load main executable ELM file from mPath (measurePath)
    const mainCql = JSON.parse(fs.readFileSync(
        path.join(mPath, `main.json`),'utf8'));

    // Load included libraries from mainCql
    const includes = mainCql.library.includes && mainCql.library.includes.def || [];
    let includedLibs = {};
    includes.forEach((l)=>{
        includedLibs[l.localIdentifier] = JSON.parse(fs.readFileSync(path.join(mPath, `${l.path}-${l.version}.json`)));
    });

    // Return Library
    return new cql.Library(mainCql, new cql.Repository(includedLibs));
}

const library = libraryBuilder(measurePath);
const bundles = bundlesBuilder(bundlesPath);

const codeService = new cqlvsac.CodeService(
    path.join(measurePath, 'vsac_cache'),true);

// Ensure that all the value sets from included libraries are present in cache folder
// if not - load from Value Set Authority Center
codeService.ensureValueSetsInLibraryWithAPIKey(library, true , undefined, true)
    .then(() => {
        console.log('All the value sets in place');
        const executor = new cql.Executor(library, codeService, undefined);
        const patientSource = cqlfhir.PatientSource.FHIRv401();
        patientSource.loadBundles(bundles);
        // execution:
        const result = executor.exec(patientSource);
        console.log(result);
        console.log('Done');
    })
    .catch((err) => console.log('Error ensureValueSetsInLibraryWithAPIKey', err));