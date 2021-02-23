const fs = require("fs");
const path = require("path");
const cql = require("cql-execution");
const cqlfhir = require("cql-exec-fhir");
const cqlvsac = require("cql-exec-vsac");

const elmFile = JSON.parse(fs.readFileSync(
    path.join(__dirname, 'r4', 'cql', 'testArtifact', 'testArtifact.json'),'utf8'));

// const libraries = {
//     FHIRHelpers: JSON.parse(fs.readFileSync(
//         path.join(__dirname, 'r4', 'cql', 'gender', 'FHIRHelpers.json'), 'utf8'))
// };

const fhirBundle1 = JSON.parse(fs.readFileSync(
    path.join(__dirname, 'r4', 'bundles', 'Johnnie679.json'),'utf8'));

const fhirBundle2 = JSON.parse(fs.readFileSync(
    path.join(__dirname, 'r4', 'bundles', 'Luna60.json'),'utf8'));

const codeService = new cqlvsac.CodeService(path
    .join(__dirname, 'r4', 'valueset'),true);

// const library = new cql.Library(elmFile, new cql.Repository(libraries));
const library = new cql.Library(elmFile);

const executor = new cql.Executor(library, codeService);
// const executor = new cql.Executor(library);

patientSource = cqlfhir.PatientSource.FHIRv401();

patientSource.loadBundles([fhirBundle1, fhirBundle2]);

const result = executor.exec(patientSource);
// console.log(JSON.stringify(result, undefined, 2));
console.log(result)