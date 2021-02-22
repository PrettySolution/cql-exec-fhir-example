const fs = require("fs");
const path = require("path");
const cql = require("cql-execution");
const cqlfhir = require("cql-exec-fhir");
const cqlvsac = require("cql-exec-vsac");

const elmFile = JSON.parse(fs.readFileSync(
    path.join(__dirname, 'r4', 'gender.json'),'utf8'));

const libraries = {
    FHIRHelpers: JSON.parse(fs.readFileSync(
        path.join(__dirname, 'r4', 'FHIRHelpers.json'), 'utf8'))
};

const fhirBundle = JSON.parse(fs.readFileSync(
    path.join(__dirname, 'r4', 'Johnnie679.json'),'utf8'));

const codeService = new cqlvsac.CodeService(path
    .join(__dirname, 'r4', 'valueset'),true);

const library = new cql.Library(elmFile, new cql.Repository(libraries));
// const library = new cql.Library(elmFile);

const executor = new cql.Executor(library, codeService);
// const executor = new cql.Executor(library);

patientSource = cqlfhir.PatientSource.FHIRv400();

patientSource.loadBundles([fhirBundle]);

const result = executor.exec(patientSource);
console.log(JSON.stringify(result, undefined, 2));